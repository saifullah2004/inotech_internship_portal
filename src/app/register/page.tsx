'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser, sendRegisterOtpAction, verifyRegisterOtpAction } from '@/lib/actions/auth';
import { useToast } from '@/components/providers/ToastProvider';
import { Loader2, CheckCircle } from 'lucide-react';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);

    // Reset OTP verification states if they change email
    if (otpSent || otpVerified) {
      setOtpSent(false);
      setOtpVerified(false);
      setOtp('');
      setOtpError('');
      setOtpSuccess('');
    }
  };

  const handleSendOtp = async () => {
    setOtpError('');
    setOtpSuccess('');

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setOtpError('Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await sendRegisterOtpAction(email);
      if (res.error) {
        setOtpError(res.error);
      } else {
        setOtpSent(true);
        setOtpSuccess('Verification code sent successfully.');
        setCooldown(30); // 30 seconds cooldown
      }
    } catch {
      setOtpError('Failed to send OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6); // only digits, max 6
    setOtp(value);
    setOtpError('');
    setOtpSuccess('');

    if (value.length === 6) {
      setOtpLoading(true);
      try {
        const res = await verifyRegisterOtpAction(email, value);
        if (res.error) {
          setOtpError(res.error);
          setOtpVerified(false);
        } else {
          setOtpVerified(true);
          setOtpSuccess('Email verified successfully.');
        }
      } catch {
        setOtpError('Failed to verify OTP. Please try again.');
      } finally {
        setOtpLoading(false);
      }
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length < 6) {
      setOtpError('Please enter a 6-digit verification code');
      return;
    }
    setOtpLoading(true);
    try {
      const res = await verifyRegisterOtpAction(email, otp);
      if (res.error) {
        setOtpError(res.error);
        setOtpVerified(false);
      } else {
        setOtpVerified(true);
        setOtpSuccess('Email verified successfully.');
      }
    } catch {
      setOtpError('Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side quick check
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = 'Full Name is required';
    if (!email) newErrors.email = 'Email is required';
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!otpVerified) {
      toast.error('Please verify your email before registering.');
      newErrors.email = 'Email verification required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const response = await registerUser(null, formData);
      if (response?.error) {
        toast.error(response.error);
      } else if (response?.success) {
        toast.success('Account created successfully!');
        router.push('/dashboard');
        router.refresh();
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo className="mb-6" />
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Create a new intern account
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold text-brand hover:text-brand-hover transition-colors"
          >
            sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 py-8 px-4 border border-neutral-100 dark:border-neutral-800/80 sm:rounded-xl sm:px-10 shadow-lg">
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            <Input
              label="Full Name"
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              placeholder="Enter your full name"
              error={errors.name}
            />

            <div className="space-y-2">
              <div className="flex items-end gap-2">
                <div className="flex-1 relative">
                  <Input
                    label="Email Address"
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={handleEmailChange}
                    placeholder="name@example.com"
                    error={errors.email}
                    className={otpVerified ? 'pr-10 border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500' : ''}
                  />
                  {otpVerified && (
                    <span className="absolute right-3 top-[38px] flex items-center text-emerald-600">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                    </span>
                  )}
                </div>
                {!otpVerified && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleSendOtp}
                    disabled={otpLoading || !email || cooldown > 0}
                    className="h-10 shrink-0 px-4 text-xs font-semibold cursor-pointer border-brand text-brand hover:bg-brand/5"
                  >
                    {otpLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-brand" />
                    ) : otpSent ? (
                      cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'
                    ) : (
                      'Send OTP'
                    )}
                  </Button>
                )}
              </div>

              {otpSent && !otpVerified && (
                <div className="p-4 rounded-lg bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 space-y-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        label="Enter 6-Digit OTP"
                        id="otp"
                        name="otp"
                        type="text"
                        maxLength={6}
                        value={otp}
                        onChange={handleOtpChange}
                        placeholder="••••••"
                        error={otpError}
                        className="tracking-widest text-center text-lg font-bold"
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpLoading || otp.length < 6}
                      className="h-10 shrink-0 px-4 text-xs font-semibold cursor-pointer"
                    >
                      {otpLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        'Verify OTP'
                      )}
                    </Button>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <p className="text-neutral-500">
                      Code expires in 5 minutes.
                    </p>
                    {cooldown > 0 ? (
                      <span className="text-neutral-400 font-medium">
                        Resend in {cooldown}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-brand hover:underline font-semibold cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {otpSuccess && (
                <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  {otpSuccess}
                </p>
              )}
            </div>

            <Input
              label="Password"
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              error={errors.password}
            />

            <Input
              label="Confirm Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              placeholder="••••••••"
              error={errors.confirmPassword}
            />

            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isPending}
              >
                Register Account
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
