'use server';

import { cookies } from 'next/headers';
import { db } from '@/lib/db';
import { verifyJWT } from '@/lib/auth';

// Helper to authenticate admin
async function getAdminUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('inotech_session')?.value;
  if (!token) return null;
  const decoded = await verifyJWT(token);
  if (!decoded || decoded.role !== 'admin') return null;
  return decoded;
}

// Admin Action: Fetch all sessions with assigned interns count
export async function adminGetSessions() {
  const admin = await getAdminUser();
  if (!admin) return { error: 'Unauthorized' };

  try {
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
    const sessionName = (formData.get('sessionName') as string || '').trim();
    const sessionCode = (formData.get('sessionCode') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const status = formData.get('status') as string || 'Active';

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
    const sessionName = (formData.get('sessionName') as string || '').trim();
    const sessionCode = (formData.get('sessionCode') as string || '').trim();
    const description = (formData.get('description') as string || '').trim();
    const startDateStr = formData.get('startDate') as string;
    const endDateStr = formData.get('endDate') as string;
    const status = formData.get('status') as string || 'Active';

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
    // Check if there are any users (interns) assigned to this session
    const internsCount = await db.user.count({
      where: {
        sessionId: id,
        role: 'user',
      },
    });

    if (internsCount > 0) {
      return { error: 'Cannot delete this session because interns are assigned to it. Try archiving it as "Completed" instead.' };
    }

    await db.internshipSession.delete({
      where: { id },
    });

    return { success: true };
  } catch (error) {
    console.error('Delete session error:', error);
    return { error: 'Failed to delete internship session' };
  }
}
