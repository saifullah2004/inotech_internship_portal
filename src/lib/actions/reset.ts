'use server';

import { db } from '@/lib/db';
import { sendOtpEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

// 1. Send OTP to registered user's email
export async function sendResetOtp(email: string) {
  if (!email) {
    return { error: 'Email address is required' };
  }

  try {
    // Check if user is registered
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { error: 'No account registered with this email address' };
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes from now

    // Save to DB
    await db.user.update({
      where: { id: user.id },
      data: {
        resetOtp: otp,
        resetOtpExpires: expires,
      },
    });

    // Send email
    await sendOtpEmail(user.email, otp, user.name);

    return { success: true };
  } catch (error) {
    console.error('Send reset OTP error:', error);
    return { error: 'Failed to send verification code. Please try again.' };
  }
}

// 2. Verify OTP
export async function verifyResetOtp(email: string, otp: string) {
  if (!email || !otp) {
    return { error: 'Email and verification code are required' };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    if (!user.resetOtp || !user.resetOtpExpires) {
      return { error: 'No active verification code found' };
    }

    if (user.resetOtp !== otp) {
      return { error: 'Incorrect verification code' };
    }

    if (new Date() > user.resetOtpExpires) {
      return { error: 'Verification code has expired' };
    }

    return { success: true };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { error: 'Failed to verify code. Please try again.' };
  }
}

// 3. Reset Password
export async function resetPassword(email: string, otp: string, newPassword: string) {
  if (!email || !otp || !newPassword) {
    return { error: 'All fields are required' };
  }

  if (newPassword.length < 6) {
    return { error: 'New password must be at least 6 characters long' };
  }

  try {
    const user = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Verify OTP again for safety
    if (!user.resetOtp || !user.resetOtpExpires || user.resetOtp !== otp || new Date() > user.resetOtpExpires) {
      return { error: 'Invalid or expired verification session' };
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password hash and clear OTP fields
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetOtp: null,
        resetOtpExpires: null,
      },
    });

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error: 'Failed to reset password. Please try again.' };
  }
}
