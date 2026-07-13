'use client';

import React, { useState, useTransition } from 'react';
import { adminChangePassword } from '@/lib/actions/intern';
import { useToast } from '@/components/providers/ToastProvider';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { KeyRound } from 'lucide-react';

export default function AdminProfilePage() {
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    // Client-side quick checks
    const valErrors: Record<string, string> = {};
    if (!currentPassword) valErrors.currentPassword = 'Required';
    if (!newPassword) {
      valErrors.newPassword = 'Required';
    } else if (newPassword.length < 6) {
      valErrors.newPassword = 'Password must be at least 6 characters';
    }
    if (newPassword !== confirmPassword) {
      valErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(valErrors).length > 0) {
      setErrors(valErrors);
      return;
    }

    const formElement = e.currentTarget;

    startTransition(async () => {
      const res = await adminChangePassword(null, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Your password has been changed successfully!');
        formElement.reset();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1.5 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Security Settings</h2>
        <p className="text-sm text-neutral-500">Update your administrator password credentials below.</p>
      </div>

      <div className="max-w-xl">
        <Card className="p-6 md:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-brand/5 dark:bg-brand/10 rounded-lg text-brand">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-800 dark:text-neutral-200">Change Password</h3>
              <p className="text-xs text-neutral-400">Keep your administrator credentials secure.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Input
              label="Current Password"
              id="currentPassword"
              name="currentPassword"
              type="password"
              required
              placeholder="••••••••"
              error={errors.currentPassword}
            />

            <Input
              label="New Password"
              id="newPassword"
              name="newPassword"
              type="password"
              required
              placeholder="••••••••"
              error={errors.newPassword}
            />

            <Input
              label="Confirm New Password"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              placeholder="••••••••"
              error={errors.confirmPassword}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                isLoading={isPending}
                className="px-6"
              >
                Change Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
