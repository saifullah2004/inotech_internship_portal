'use client';

import React, { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { registerUser } from '@/lib/actions/auth';
import { useToast } from '@/components/providers/ToastProvider';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

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
              placeholder="John Doe"
              error={errors.name}
            />

            <Input
              label="Email Address"
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="john@example.com"
              error={errors.email}
            />

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
