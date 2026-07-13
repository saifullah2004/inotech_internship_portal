'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signJWT } from '@/lib/auth';
import { loginSchema, registerSchema } from '@/lib/validations';

export async function registerUser(prevState: unknown, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validation = registerSchema.safeParse({ name, email, password });
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // Check if user already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: 'Email address is already registered' };
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'user',
        applicationStatus: 'not_submitted',
      },
    });

    // Generate JWT token
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      applicationStatus: user.applicationStatus,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('inotech_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Registration error:', error);
    return { error: 'An error occurred during registration. Please try again.' };
  }
}

export async function loginUser(prevState: unknown, formData: FormData) {
  try {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validation = loginSchema.safeParse({ email, password });
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // Find user
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: 'Invalid email or password' };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return { error: 'Invalid email or password' };
    }

    // Check application status and handle declining redirects or cleanups if needed
    // (Actual redirect will happen on dashboard route or client side, but we authenticate first)

    // Generate JWT token
    const token = await signJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      applicationStatus: user.applicationStatus,
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('inotech_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Login error:', error);
    return { error: 'An error occurred during login. Please try again.' };
  }
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete('inotech_session');
  return { success: true };
}
