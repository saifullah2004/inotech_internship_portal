import crypto from 'crypto';

interface OtpData {
  otp: string;
  expiresAt: number;
  attempts: number;
  verified: boolean;
  lastSentAt: number;
}

// Global token store using globalThis to prevent hot-reload wipes in Next.js development mode
const globalForOtp = globalThis as unknown as {
  otpMap: Map<string, OtpData>;
};

export const otpMap = globalForOtp.otpMap || new Map<string, OtpData>();

if (process.env.NODE_ENV !== 'production') {
  globalForOtp.otpMap = otpMap;
}

export function generateRegisterOtp(email: string): string {
  // Generate secure 6-digit OTP
  const otpVal = crypto.randomInt(100000, 999999).toString();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  otpMap.set(email.toLowerCase(), {
    otp: otpVal,
    expiresAt,
    attempts: 0,
    verified: false,
    lastSentAt: Date.now(),
  });

  return otpVal;
}

export function getOtpData(email: string) {
  return otpMap.get(email.toLowerCase());
}

export function incrementOtpAttempts(email: string) {
  const data = otpMap.get(email.toLowerCase());
  if (data) {
    data.attempts += 1;
    if (data.attempts >= 5) {
      // Invalidate on too many attempts
      otpMap.delete(email.toLowerCase());
    }
  }
}

export function setOtpVerified(email: string) {
  const data = otpMap.get(email.toLowerCase());
  if (data) {
    data.verified = true;
    data.otp = ''; // Clear actual code to prevent replay attacks
  }
}

export function invalidateOtp(email: string) {
  otpMap.delete(email.toLowerCase());
}
