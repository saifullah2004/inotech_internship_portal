'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/lib/actions/auth';
import { useToast } from '@/components/providers/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import Modal from '@/components/ui/Modal';
import { sendResetOtp, verifyResetOtp, resetPassword } from '@/lib/actions/reset';

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset password state hooks
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<'send_email' | 'verify_otp' | 'reset_password'>('send_email');
  const [resetEmail, setResetEmail] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetPending, startResetTransition] = useTransition();
  const [resetErrors, setResetErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // Client-side quick check
    const newErrors: Record<string, string> = {};
    if (!email) newErrors.email = 'Email is required';
    if (!password) newErrors.password = 'Password is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    startTransition(async () => {
      const response = await loginUser(null, formData);
      if (response?.error) {
        toast.error(response.error);
      } else if (response?.success) {
        toast.success('Successfully logged in!');
        if (response.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
        router.refresh();
      }
    });
  };

  const handleForgotPasswordClick = () => {
    const emailInput = document.getElementById('email') as HTMLInputElement | null;
    const typedEmail = emailInput?.value || '';
    setResetEmail(typedEmail);
    setResetStep('send_email');
    setResetOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setResetErrors({});
    setResetModalOpen(true);
  };

  const handleSendOtp = () => {
    setResetErrors({});
    if (!resetEmail) {
      setResetErrors({ email: 'Email address is required' });
      return;
    }
    if (!resetEmail.includes('@')) {
      setResetErrors({ email: 'Please enter a valid email address' });
      return;
    }

    startResetTransition(async () => {
      const res = await sendResetOtp(resetEmail);
      if (res.error) {
        toast.error(res.error);
        setResetErrors({ email: res.error });
      } else {
        toast.success('A 6-digit verification code has been sent to your email.');
        setResetStep('verify_otp');
      }
    });
  };

  const handleVerifyOtp = () => {
    setResetErrors({});
    if (!resetOtp) {
      setResetErrors({ otp: 'Verification code is required' });
      return;
    }
    if (resetOtp.length !== 6 || isNaN(Number(resetOtp))) {
      setResetErrors({ otp: 'Code must be a 6-digit number' });
      return;
    }

    startResetTransition(async () => {
      const res = await verifyResetOtp(resetEmail, resetOtp);
      if (res.error) {
        toast.error(res.error);
        setResetErrors({ otp: res.error });
      } else {
        toast.success('Code verified successfully!');
        setResetStep('reset_password');
      }
    });
  };

  const handleResetPassword = () => {
    setResetErrors({});
    const errors: Record<string, string> = {};
    if (!newPassword) errors.newPassword = 'New password is required';
    else if (newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setResetErrors(errors);
      return;
    }

    startResetTransition(async () => {
      const res = await resetPassword(resetEmail, resetOtp, newPassword);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Password reset successfully! You can now log in.');
        setResetModalOpen(false);
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">

      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Logo className="mb-6" />
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-neutral-600 dark:text-neutral-400">
          Or{' '}
          <Link
            href="/register"
            className="font-semibold text-brand hover:text-brand-hover transition-colors"
          >
            register for a new intern account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-neutral-900 py-8 px-4 border border-neutral-100 dark:border-neutral-800/80 sm:rounded-xl sm:px-10 shadow-lg">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="you@example.com"
              error={errors.email}
            />

            <div className="space-y-1">
              <Input
                label="Password"
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="••••••••"
                error={errors.password}
              />
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors cursor-pointer text-right"
                >
                  Forgot Password?
                </button>
              </div>
            </div>

            <div>
              <Button
                type="submit"
                fullWidth
                isLoading={isPending}
              >
                Sign In
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Your Password"
      >
        {resetStep === 'send_email' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-500">
              Enter your email address below. If you have an active account, we will send you a 6-digit verification code.
            </p>
            <Input
              label="Email Address"
              id="resetEmail"
              type="email"
              required
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="you@example.com"
              error={resetErrors.email}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setResetModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="button"
                isLoading={resetPending}
                onClick={handleSendOtp}
              >
                Send Verification Code
              </Button>
            </div>
          </div>
        )}

        {resetStep === 'verify_otp' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-500">
              We have sent a verification code to <span className="font-semibold">{resetEmail}</span>. Please enter the code below to proceed.
            </p>
            <Input
              label="Verification Code (OTP)"
              id="resetOtp"
              type="text"
              required
              value={resetOtp}
              onChange={(e) => setResetOtp(e.target.value)}
              placeholder="123456"
              maxLength={6}
              error={resetErrors.otp}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setResetStep('send_email')}
              >
                Back
              </Button>
              <Button
                type="button"
                isLoading={resetPending}
                onClick={handleVerifyOtp}
              >
                Verify Code
              </Button>
            </div>
          </div>
        )}

        {resetStep === 'reset_password' && (
          <div className="space-y-4">
            <p className="text-xs text-neutral-500">
              Your code has been verified. Choose a strong new password for your account.
            </p>
            <Input
              label="New Password"
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              error={resetErrors.newPassword}
            />
            <Input
              label="Confirm New Password"
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              error={resetErrors.confirmPassword}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                isLoading={resetPending}
                onClick={handleResetPassword}
              >
                Reset Password
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
