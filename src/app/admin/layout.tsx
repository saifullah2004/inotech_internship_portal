'use client';

import React, { useState, useTransition } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { logoutUser } from '@/lib/actions/auth';
import { useToast } from '@/components/providers/ToastProvider';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import { LayoutDashboard, Calendar, Users, User, LogOut, Menu, X } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    startTransition(async () => {
      await logoutUser();
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    });
  };

  const navItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Internship Sessions', href: '/admin/sessions', icon: Calendar },
    { name: 'Interns', href: '/admin/interns', icon: Users },
    { name: 'Profile', href: '/admin/profile', icon: User },
  ];

  return (
    <div className="min-h-screen flex bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-neutral-900/40 dark:bg-neutral-950/60 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar navigation */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 z-50 flex flex-col justify-between transform transition-transform duration-200 lg:translate-x-0 lg:sticky lg:top-0 lg:h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
          {/* Sidebar Header with Logo */}
          <div className="h-16 border-b border-neutral-100 dark:border-neutral-850 px-6 flex items-center justify-between shrink-0">
            <Logo href="/admin/dashboard" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-250 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-brand/5 text-brand dark:bg-brand/10'
                      : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand' : 'text-neutral-400'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-neutral-100 dark:border-neutral-850">
          <Button
            variant="ghost"
            fullWidth
            isLoading={isPending}
            onClick={handleLogout}
            className="flex items-center justify-start gap-3 px-4 py-3 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
          >
            <LogOut className="w-4 h-4 text-neutral-400" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Main content wrapper */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-250 cursor-pointer"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-lg font-bold tracking-tight text-neutral-800 dark:text-neutral-200">
              Admin Portal
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center font-bold text-sm text-brand">
                A
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs text-neutral-400 block leading-none">Logged in as</span>
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
