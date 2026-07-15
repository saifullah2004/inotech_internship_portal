'use server';

import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signJWT } from '@/lib/auth';
import { loginSchema, registerSchema } from '@/lib/validations';
import { autoUpdateSessionStatuses } from './session';

export async function registerUser(prevState: unknown, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const validation = registerSchema.safeParse({ name, email, password });
    if (!validation.success) {
      return { error: validation.error.issues[0].message };
    }

    // Validate email verification status
    const otpData = getOtpData(email);
    if (!otpData || !otpData.verified) {
      return { error: 'Please verify your email before registering.' };
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

    // Automatically update statuses first
    await autoUpdateSessionStatuses();

    // Find latest active session
    const latestSession = await db.internshipSession.findFirst({
      where: { status: 'Active' },
      orderBy: { createdAt: 'desc' },
    });

    // Create user
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: 'user',
        applicationStatus: 'not_submitted',
        sessionId: latestSession ? latestSession.id : null,
      },
    });

    // Clean up OTP session
    invalidateOtp(email);

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

export async function sendRegisterOtpAction(email: string) {
  if (!email) {
    return { error: 'Email address is required' };
  }

  // Validate format
  const emailValidation = z.string().email().safeParse(email);
  if (!emailValidation.success) {
    return { error: 'Please enter a valid email address' };
  }

  try {
    // Check if user already exists in DB
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return { error: 'Email address is already registered' };
    }

    const existingOtp = getOtpData(email);
    if (existingOtp) {
      const timeSinceLast = Date.now() - existingOtp.lastSentAt;
      if (timeSinceLast < 30 * 1000) { // 30 seconds cooldown
        const secondsLeft = Math.ceil((30 * 1000 - timeSinceLast) / 1000);
        return { error: `Please wait ${secondsLeft}s before requesting a new OTP.` };
      }
    }

    // Generate and store OTP
    const otp = generateRegisterOtp(email);

    // Send email
    await sendRegistrationOtpEmail(email.toLowerCase(), otp);

    return { success: true };
  } catch (error) {
    console.error('Send register OTP error:', error);
    return { error: 'Failed to send verification code. Please try again.' };
  }
}

export async function verifyRegisterOtpAction(email: string, otp: string) {
  if (!email || !otp) {
    return { error: 'Email and verification code are required' };
  }

  try {
    const data = getOtpData(email);

    if (!data) {
      return { error: 'No active verification session found. Please request a code.' };
    }

    // Check expiration
    if (Date.now() > data.expiresAt) {
      invalidateOtp(email);
      return { error: 'OTP has expired. Please request a new OTP.' };
    }

    // Check attempts
    if (data.otp !== otp) {
      incrementOtpAttempts(email);
      const updatedData = getOtpData(email);
      if (!updatedData) {
        return { error: 'Too many incorrect attempts. Please request a new OTP.' };
      }
      const attemptsLeft = 5 - updatedData.attempts;
      return { error: `Invalid OTP. ${attemptsLeft} attempts remaining.` };
    }

    // Mark as verified
    setOtpVerified(email);
    return { success: true };
  } catch (error) {
    console.error('Verify register OTP error:', error);
    return { error: 'Failed to verify OTP. Please try again.' };
  }
}
