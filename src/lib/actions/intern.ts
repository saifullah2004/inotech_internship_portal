'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyJWT, signJWT } from '@/lib/auth';
import { internDetailsSchema, adminPasswordSchema } from '@/lib/validations';
import fs from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

// Helper to authenticate user from session
async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('inotech_session')?.value;
  if (!token) return null;
  return await verifyJWT(token);
}

// User Action: Check current status and update JWT if status changed
export async function checkUserStatus() {
  const sessionUser = await getSessionUser();
  if (!sessionUser) return { error: 'Unauthorized' };

  try {
    const user = await db.user.findUnique({
      where: { id: sessionUser.userId },
      include: {
        internDetails: true,
        internRequests: {
          orderBy: { requestedAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) return { error: 'User not found' };

    // If database status differs from token status, update the session cookie
    if (user.applicationStatus !== sessionUser.applicationStatus) {
      const token = await signJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        applicationStatus: user.applicationStatus,
      });
      const cookieStore = await cookies();
      cookieStore.set('inotech_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });
    }

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        applicationStatus: user.applicationStatus,
      },
      internDetails: user.internDetails,
      latestRequest: user.internRequests[0] || null,
    };
  } catch (error) {
    console.error('Check user status error:', error);
    return { error: 'Failed to retrieve application status' };
  }
}

// User Action: Auto-submit pending request on first login if status is not_submitted
export async function createPendingRequest() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'user') return { error: 'Unauthorized' };

  try {
    const user = await db.user.findUnique({
      where: { id: sessionUser.userId },
    });

    if (!user) return { error: 'User not found' };

    if (user.applicationStatus === 'not_submitted') {
      // Begin transaction to create request and update user status
      await db.$transaction([
        db.internRequest.create({
          data: {
            userId: user.id,
            status: 'pending',
          },
        }),
        db.user.update({
          where: { id: user.id },
          data: {
            applicationStatus: 'pending_approval',
          },
        }),
      ]);

      // Re-sign JWT cookie
      const token = await signJWT({
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        applicationStatus: 'pending_approval',
      });

      const cookieStore = await cookies();
      cookieStore.set('inotech_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24,
      });

      return { success: true, status: 'pending_approval' };
    }

    return { success: true, status: user.applicationStatus };
  } catch (error) {
    console.error('Create pending request error:', error);
    return { error: 'Failed to initiate internship request' };
  }
}

// User Action: Submit internship details form and files
export async function submitInternshipDetails(formData: FormData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'user') return { error: 'Unauthorized' };

  try {
    // 1. Fetch user to confirm state
    const user = await db.user.findUnique({
      where: { id: sessionUser.userId },
      include: { internDetails: true },
    });

    if (!user) return { error: 'User not found' };
    if (user.applicationStatus !== 'approved') {
      return { error: 'Your account is not approved to submit details' };
    }
    if (user.internDetails) {
      return { error: 'You have already submitted your details' };
    }

    // 2. Parse fields
    const fullName = formData.get('fullName') as string;
    const fatherName = formData.get('fatherName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const university = formData.get('university') as string;
    const department = formData.get('department') as string;
    const semester = formData.get('semester') as string;
    const cgpa = formData.get('cgpa') as string;
    const startDate = formData.get('startDate') as string;
    const termsAccepted = formData.get('termsAccepted') === 'true';

    // Validate using Zod
    const validation = internDetailsSchema.safeParse({
      fullName,
      fatherName,
      email: user.email,
      phone,
      address,
      university,
      department,
      semester,
      cgpa,
      startDate,
      termsAccepted,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // 3. Process uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', String(user.id));
    await fs.mkdir(uploadsDir, { recursive: true });

    const requiredFiles = ['picture', 'cv', 'cnic'];
    const optionalFiles = ['recommendationLetter', 'policeVerification'];
    const filePaths: Record<string, string | null> = {
      picture: null,
      cv: null,
      cnic: null,
      recommendationLetter: null,
      policeVerification: null,
    };

    // Process required
    for (const key of requiredFiles) {
      const file = formData.get(key) as File | null;
      if (!file || file.size === 0) {
        return { error: `Required document is missing: ${key}` };
      }

      // Validations
      if (key === 'picture' && !file.type.startsWith('image/')) {
        return { error: 'Picture must be an image file' };
      }
      if (key === 'cv' && file.type !== 'application/pdf') {
        return { error: 'CV must be a PDF file' };
      }
      if (key === 'cnic' && !file.type.startsWith('image/') && file.type !== 'application/pdf') {
        return { error: 'CNIC must be an image or a PDF file' };
      }

      // Write file
      const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.jpg');
      const filename = `${key}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      filePaths[key] = `/uploads/${user.id}/${filename}`;
    }

    // Process optional
    for (const key of optionalFiles) {
      const file = formData.get(key) as File | null;
      if (file && file.size > 0) {
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
          return { error: `${key} must be an image or a PDF file` };
        }
        const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.jpg');
        const filename = `${key}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        filePaths[key] = `/uploads/${user.id}/${filename}`;
      }
    }

    // 4. Save to database
    await db.$transaction([
      db.internDetail.create({
        data: {
          userId: user.id,
          fullName,
          fatherName,
          phone,
          address,
          university,
          department,
          semester,
          cgpa: parseFloat(cgpa),
          startDate: new Date(startDate),
          picturePath: filePaths.picture!,
          cvPath: filePaths.cv!,
          cnicPath: filePaths.cnic!,
          recommendationLetterPath: filePaths.recommendationLetter,
          policeVerificationPath: filePaths.policeVerification,
          termsAccepted: true,
        },
      }),
      db.user.update({
        where: { id: user.id },
        data: {
          applicationStatus: 'submitted',
        },
      }),
    ]);

    // Re-sign JWT
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      applicationStatus: 'submitted',
    });

    const cookieStore = await cookies();
    cookieStore.set('inotech_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24,
    });

    const missingDocs: string[] = [];
    if (!filePaths.recommendationLetter) missingDocs.push('University Recommendation Letter');
    if (!filePaths.policeVerification) missingDocs.push('Police Verification Certificate');

    return {
      success: true,
      missingDocs: missingDocs.length > 0 ? missingDocs : null,
    };
  } catch (error) {
    console.error('Submit intern details error:', error);
    return { error: 'Failed to upload details. Please try again.' };
  }
}

// User Action: Upload single missing optional document
export async function uploadMissingDocument(formData: FormData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'user') return { error: 'Unauthorized' };

  try {
    const docType = formData.get('docType') as string; // 'recommendationLetter' | 'policeVerification'
    const file = formData.get('file') as File | null;

    if (docType !== 'recommendationLetter' && docType !== 'policeVerification') {
      return { error: 'Invalid document type requested' };
    }
    if (!file || file.size === 0) {
      return { error: 'No file provided' };
    }
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      return { error: 'File must be an image or a PDF' };
    }

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', String(sessionUser.userId));
    await fs.mkdir(uploadsDir, { recursive: true });

    const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.jpg');
    const filename = `${docType}${ext}`;
    const filePath = path.join(uploadsDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buffer);

    const relativePath = `/uploads/${sessionUser.userId}/${filename}`;

    const updateData: Record<string, string> = {};
    if (docType === 'recommendationLetter') {
      updateData.recommendationLetterPath = relativePath;
    } else {
      updateData.policeVerificationPath = relativePath;
    }

    await db.internDetail.update({
      where: { userId: sessionUser.userId },
      data: updateData,
    });

    return { success: true, path: relativePath };
  } catch (error) {
    console.error('Upload missing doc error:', error);
    return { error: 'Failed to upload missing document. Please try again.' };
  }
}

/* ==========================================
   ADMIN ACTIONS
   ========================================== */

// Admin Action: Fetch Summary Stats
export async function adminGetDashboardStats() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') return { error: 'Unauthorized' };

  try {
    const [totalUsers, totalInterns, pendingRequests] = await Promise.all([
      db.user.count({ where: { role: 'user' } }),
      db.user.count({ where: { applicationStatus: 'submitted' } }),
      db.user.count({ where: { applicationStatus: 'pending_approval' } }),
    ]);

    return {
      success: true,
      stats: {
        totalUsers,
        totalInterns,
        pendingRequests,
      },
    };
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    return { error: 'Failed to retrieve stats' };
  }
}

// Admin Action: Get all interns list
export async function adminGetInterns() {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') return { error: 'Unauthorized' };

  try {
    const interns = await db.user.findMany({
      where: { role: 'user' },
      include: {
        internDetails: true,
        internRequests: {
          orderBy: { requestedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      interns: interns.map((user) => {
        // Calculate missing documents
        const missingDocs: string[] = [];
        if (user.applicationStatus === 'submitted' && user.internDetails) {
          if (!user.internDetails.recommendationLetterPath) missingDocs.push('recommendationLetter');
          if (!user.internDetails.policeVerificationPath) missingDocs.push('policeVerification');
        }
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          applicationStatus: user.applicationStatus,
          createdAt: user.createdAt.toISOString(),
          university: user.internDetails?.university || null,
          department: user.internDetails?.department || null,
          missingDocs,
          latestRequest: user.internRequests[0] || null,
        };
      }),
    };
  } catch (error) {
    console.error('Fetch interns error:', error);
    return { error: 'Failed to fetch interns' };
  }
}

// Admin Action: Accept or Decline user request
export async function adminDecideRequest(userId: number, status: 'approved' | 'declined') {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') return { error: 'Unauthorized' };

  try {
    const latestRequest = await db.internRequest.findFirst({
      where: { userId, status: 'pending' },
      orderBy: { requestedAt: 'desc' },
    });

    const statusMap = {
      approved: 'approved',
      declined: 'declined',
    };

    const userStatus = statusMap[status];

    await db.$transaction(async (tx) => {
      // 1. Update the request if found
      if (latestRequest) {
        await tx.internRequest.update({
          where: { id: latestRequest.id },
          data: {
            status: status,
            decidedAt: new Date(),
            decidedBy: sessionUser.userId,
          },
        });
      } else {
        // If not found, create one
        await tx.internRequest.create({
          data: {
            userId,
            status,
            decidedAt: new Date(),
            decidedBy: sessionUser.userId,
          },
        });
      }

      // 2. Update user status
      await tx.user.update({
        where: { id: userId },
        data: {
          applicationStatus: userStatus,
        },
      });
    });

    return { success: true };
  } catch (error) {
    console.error('Decide request error:', error);
    return { error: 'Failed to record decision. Please try again.' };
  }
}

// Admin Action: Edit Intern details
export async function adminUpdateInternDetails(userId: number, formData: FormData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') return { error: 'Unauthorized' };

  try {
    const internDetail = await db.internDetail.findUnique({
      where: { userId },
    });

    if (!internDetail) return { error: 'Intern details not found' };

    // Get text fields
    const fullName = formData.get('fullName') as string;
    const fatherName = formData.get('fatherName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const university = formData.get('university') as string;
    const department = formData.get('department') as string;
    const semester = formData.get('semester') as string;
    const cgpa = formData.get('cgpa') as string;
    const startDate = formData.get('startDate') as string;

    // Build update data
    const updateData: {
      fullName: string;
      fatherName: string;
      phone: string;
      address: string;
      university: string;
      department: string;
      semester: string;
      cgpa: number;
      startDate: Date;
      picturePath?: string;
      cvPath?: string;
      cnicPath?: string;
      recommendationLetterPath?: string;
      policeVerificationPath?: string;
    } = {
      fullName,
      fatherName,
      phone,
      address,
      university,
      department,
      semester,
      cgpa: parseFloat(cgpa),
      startDate: new Date(startDate),
    };

    // Process file uploads
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', String(userId));
    await fs.mkdir(uploadsDir, { recursive: true });

    const fileKeys = ['picture', 'cv', 'cnic', 'recommendationLetter', 'policeVerification'];
    
    for (const key of fileKeys) {
      const file = formData.get(key) as File | null;
      if (file && file.size > 0) {
        // Save file
        const buffer = Buffer.from(await file.arrayBuffer());
        // Determine file extension
        const ext = path.extname(file.name) || (key === 'cv' ? '.pdf' : '.png');
        const fileName = `${key}${ext}`;
        const filePath = path.join(uploadsDir, fileName);
        await fs.writeFile(filePath, buffer);

        // Map database field name
        const dbFieldName = key === 'picture' ? 'picturePath'
                          : key === 'cv' ? 'cvPath'
                          : key === 'cnic' ? 'cnicPath'
                          : key === 'recommendationLetter' ? 'recommendationLetterPath'
                          : 'policeVerificationPath';

        updateData[dbFieldName] = `/uploads/${userId}/${fileName}`;
      }
    }

    await db.internDetail.update({
      where: { userId },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error('Update intern details error:', error);
    return { error: 'Failed to update details' };
  }
}

// Admin Action: Create Intern Manually
export async function adminCreateInternManually(formData: FormData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') return { error: 'Unauthorized' };

  try {
    const name = formData.get('fullName') as string;
    const email = formData.get('email') as string;
    const fatherName = formData.get('fatherName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const university = formData.get('university') as string;
    const department = formData.get('department') as string;
    const semester = formData.get('semester') as string;
    const cgpa = formData.get('cgpa') as string;
    const startDate = formData.get('startDate') as string;

    // Check if email already registered
    const existingUser = await db.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return { error: 'This email is already registered' };
    }

    // Validate fields (except terms Accepted which admin skips, but we set it to true)
    const validation = internDetailsSchema.safeParse({
      fullName: name,
      fatherName,
      email,
      phone,
      address,
      university,
      department,
      semester,
      cgpa,
      startDate,
      termsAccepted: true,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // Process required uploads for manual creation
    const requiredFiles = ['picture', 'cv', 'cnic'];
    const optionalFiles = ['recommendationLetter', 'policeVerification'];
    const filePaths: Record<string, string | null> = {
      picture: null,
      cv: null,
      cnic: null,
      recommendationLetter: null,
      policeVerification: null,
    };

    // First create a temporary dummy user to get their user ID (or create transaction after checking files)
    // To be safe, let's verify files are attached first
    for (const key of requiredFiles) {
      const file = formData.get(key) as File | null;
      if (!file || file.size === 0) {
        return { error: `Required document is missing: ${key}` };
      }
      if (key === 'picture' && !file.type.startsWith('image/')) return { error: 'Picture must be an image' };
      if (key === 'cv' && file.type !== 'application/pdf') return { error: 'CV must be a PDF' };
      if (key === 'cnic' && !file.type.startsWith('image/') && file.type !== 'application/pdf') return { error: 'CNIC must be PDF or image' };
    }

    // Generate random password for manually added user (they can reset it, or use default)
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('inotech123', salt);

    const newUser = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'user',
        applicationStatus: 'submitted', // Mark already submitted
      },
    });

    // Write files to user's dir
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', String(newUser.id));
    await fs.mkdir(uploadsDir, { recursive: true });

    // Process required
    for (const key of requiredFiles) {
      const file = formData.get(key) as File;
      const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.jpg');
      const filename = `${key}${ext}`;
      const filePath = path.join(uploadsDir, filename);
      const buffer = Buffer.from(await file.arrayBuffer());
      await fs.writeFile(filePath, buffer);
      filePaths[key] = `/uploads/${newUser.id}/${filename}`;
    }

    // Process optional
    for (const key of optionalFiles) {
      const file = formData.get(key) as File | null;
      if (file && file.size > 0) {
        const ext = path.extname(file.name) || (file.type === 'application/pdf' ? '.pdf' : '.jpg');
        const filename = `${key}${ext}`;
        const filePath = path.join(uploadsDir, filename);
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
        filePaths[key] = `/uploads/${newUser.id}/${filename}`;
      }
    }

    // Create details
    await db.internDetail.create({
      data: {
        userId: newUser.id,
        fullName: name,
        fatherName,
        phone,
        address,
        university,
        department,
        semester,
        cgpa: parseFloat(cgpa),
        startDate: new Date(startDate),
        picturePath: filePaths.picture!,
        cvPath: filePaths.cv!,
        cnicPath: filePaths.cnic!,
        recommendationLetterPath: filePaths.recommendationLetter,
        policeVerificationPath: filePaths.policeVerification,
        termsAccepted: true,
      },
    });

    return { success: true, userId: newUser.id };
  } catch (error) {
    console.error('Manual intern creation error:', error);
    return { error: 'Failed to create intern profile. Please try again.' };
  }
}

// Admin Action: Change own password
export async function adminChangePassword(prevState: unknown, formData: FormData) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') return { error: 'Unauthorized' };

  try {
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    const validation = adminPasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmPassword,
    });

    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    const admin = await db.user.findUnique({
      where: { id: sessionUser.userId },
    });

    if (!admin) return { error: 'Admin account not found' };

    // Verify current password
    const isCurrentValid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isCurrentValid) {
      return { error: 'Current password is incorrect' };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const newPasswordHash = await bcrypt.hash(newPassword, salt);

    // Update in DB
    await db.user.update({
      where: { id: admin.id },
      data: {
        passwordHash: newPasswordHash,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Change password error:', error);
    return { error: 'Failed to update password' };
  }
}

// Admin Action: Fetch single intern profile details
export async function adminGetInternById(id: number) {
  const sessionUser = await getSessionUser();
  if (!sessionUser || sessionUser.role !== 'admin') return { error: 'Unauthorized' };

  try {
    const user = await db.user.findUnique({
      where: { id },
      include: {
        internDetails: true,
        internRequests: {
          orderBy: { requestedAt: 'desc' },
        },
      },
    });

    if (!user) return { error: 'Intern not found' };

    return { success: true, intern: user };
  } catch (error) {
    console.error('Get intern by id error:', error);
    return { error: 'Failed to fetch intern profile' };
  }
}
