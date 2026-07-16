'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { promises as fs } from 'fs';
import path from 'path';

// Helper to authenticate admin
async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('inotech_session')?.value;
  if (!token) return null;
  const decoded = await verifyJWT(token);
  if (!decoded || decoded.role !== 'admin') return null;
  return decoded;
}

// Helper to calculate status based on start/end dates
function calculateSessionStatus(startDate: Date, endDate: Date): string {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sessionStart = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const sessionEnd = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

  if (today < sessionStart) {
    return 'Pending';
  } else if (today > sessionEnd) {
    return 'Completed';
  } else {
    return 'Active';
  }
}

// Auto update session statuses based on current date
export async function autoUpdateSessionStatuses() {
  try {
    const sessions = await db.internshipSession.findMany();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    for (const session of sessions) {
      const sessionEnd = new Date(session.endDate.getFullYear(), session.endDate.getMonth(), session.endDate.getDate());
      const sessionStart = new Date(session.startDate.getFullYear(), session.startDate.getMonth(), session.startDate.getDate());

      let newStatus = session.status;

      // 1. If today is after the end date, it must automatically become Completed
      if (today > sessionEnd) {
        newStatus = 'Completed';
      }
      // 2. If it is Pending, and today has reached the start date, it automatically becomes Active
      else if (session.status === 'Pending' && today >= sessionStart && today <= sessionEnd) {
        newStatus = 'Active';
      }

      if (session.status !== newStatus) {
        await db.internshipSession.update({
          where: { id: session.id },
          data: { status: newStatus },
        });
      }
    }
  } catch (error) {
    console.error('Error auto-updating session statuses:', error);
  }
}

// Admin Action: Fetch all sessions with assigned interns count
export async function adminGetSessions() {
  const admin = await getAdminUser();
  if (!admin) return { error: 'Unauthorized' };

  try {
    // Automatically update statuses first
    await autoUpdateSessionStatuses();

    const sessions = await db.internshipSession.findMany({
      include: {
        _count: {
          select: { users: { where: { role: 'user' } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return {
      success: true,
      sessions: sessions.map(session => ({
        id: session.id,
        sessionName: session.sessionName,
        sessionCode: session.sessionCode,
        description: session.description,
        startDate: session.startDate.toISOString(),
        endDate: session.endDate.toISOString(),
        status: session.status,
        createdAt: session.createdAt.toISOString(),
        totalInterns: session._count.users,
      })),
    };
  } catch (error) {
    console.error('Fetch sessions error:', error);
    return { error: 'Failed to retrieve internship sessions' };
  }
}

// Admin Action: Fetch active sessions
export async function adminGetActiveSessions() {
  const admin = await getAdminUser();
  if (!admin) return { error: 'Unauthorized' };

  try {
    // Automatically update statuses first
    await autoUpdateSessionStatuses();

    const sessions = await db.internshipSession.findMany({
      where: { status: 'Active' },
      orderBy: { startDate: 'desc' },
    });

    return {
      success: true,
      sessions: sessions.map(session => ({
        id: session.id,
        sessionName: session.sessionName,
        sessionCode: session.sessionCode,
        startDate: session.startDate.toISOString(),
        endDate: session.endDate.toISOString(),
        status: session.status,
      })),
    };
  } catch (error) {
    console.error('Fetch active sessions error:', error);
    return { error: 'Failed to retrieve active sessions' };
  }
}

// Admin Action: Create a new session
export async function adminCreateSession(formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: 'Unauthorized' };

  try {
    // Automatically update statuses first
    await autoUpdateSessionStatuses();

    const sessionName = (formData.get('sessionName') as string || '').trim();
    const sessionCode = (formData.get('sessionCode') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const formStatus = formData.get('status') as string;

    // Validation
    if (!sessionName) {
      return { error: 'Session Name is required' };
    }
    if (!startDateStr || !endDateStr) {
      return { error: 'Start Date and End Date are required' };
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { error: 'Invalid dates provided' };
    }

    if (endDate <= startDate) {
      return { error: 'End Date must be strictly after the Start Date' };
    }

    const status = formStatus || calculateSessionStatus(startDate, endDate);

    // Prevent duplicate active sessions with same name
    if (status === 'Active') {
      const existing = await db.internshipSession.findFirst({
        where: {
          sessionName: { equals: sessionName },
          status: 'Active',
        },
      });
      if (existing) {
        return { error: `An active session with the name "${sessionName}" already exists` };
      }
    }

    const newSession = await db.internshipSession.create({
      data: {
        sessionName,
        sessionCode: sessionCode || null,
        description: description || null,
        startDate,
        endDate,
        status,
      },
    });

    return { success: true, session: newSession };
  } catch (error) {
    console.error('Create session error:', error);
    return { error: 'Failed to create internship session' };
  }
}

// Admin Action: Update a session
export async function adminUpdateSession(id: number, formData: FormData) {
  const admin = await getAdminUser();
  if (!admin) return { error: 'Unauthorized' };

  try {
    // Automatically update statuses first
    await autoUpdateSessionStatuses();

    const sessionName = (formData.get('sessionName') as string || '').trim();
    const sessionCode = (formData.get('sessionCode') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const formStatus = formData.get('status') as string;

    // Validation
    if (!sessionName) {
      return { error: 'Session Name is required' };
    }
    if (!startDateStr || !endDateStr) {
      return { error: 'Start Date and End Date are required' };
    }

    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return { error: 'Invalid dates provided' };
    }

    if (endDate <= startDate) {
      return { error: 'End Date must be strictly after the Start Date' };
    }

    const status = formStatus || calculateSessionStatus(startDate, endDate);

    // Prevent duplicate active sessions with same name
    if (status === 'Active') {
      const existing = await db.internshipSession.findFirst({
        where: {
          sessionName: { equals: sessionName },
          status: 'Active',
          NOT: { id },
        },
      });
      if (existing) {
        return { error: `An active session with the name "${sessionName}" already exists` };
      }
    }

    const updatedSession = await db.internshipSession.update({
      where: { id },
      data: {
        sessionName,
        sessionCode: sessionCode || null,
        description: description || null,
        startDate,
        endDate,
        status,
      },
    });

    return { success: true, session: updatedSession };
  } catch (error) {
    console.error('Update session error:', error);
    return { error: 'Failed to update internship session' };
  }
}

// Admin Action: Delete a session
export async function adminDeleteSession(id: number) {
  const admin = await getAdminUser();
  if (!admin) return { error: 'Unauthorized' };

  try {
    // Automatically update statuses first
    await autoUpdateSessionStatuses();

    // Find all users (interns) assigned to this session
    const interns = await db.user.findMany({
      where: {
        sessionId: id,
      },
      select: {
        id: true,
      },
    });

    // Delete filesystem uploads folder for each intern
    for (const intern of interns) {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', String(intern.id));
      try {
        await fs.rm(uploadsDir, { recursive: true, force: true });
      } catch (e) {
        console.error(`Failed to clean up uploads directory for user ${intern.id}:`, e);
      }
    }

    // Delete all users in this session (cascade deletes their details and requests)
    await db.user.deleteMany({
      where: {
        sessionId: id,
      },
    });

    // Now delete the session
    await db.internshipSession.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete session error:', error);
    return { error: 'Failed to delete internship session' };
  }
}
