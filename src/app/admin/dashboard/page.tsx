'use client';

import React, { useEffect, useState } from 'react';
import { adminGetDashboardStats } from '@/lib/actions/intern';
import { useToast } from '@/components/providers/ToastProvider';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Loader2, Users, CheckCircle, Clock, ArrowRight, Plus } from 'lucide-react';
import LinkItem from 'next/link';

export default function AdminDashboard() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalInterns: 0,
    pendingRequests: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      const res = await adminGetDashboardStats();
      if (res.error) {
        toast.error(res.error);
      } else if (res.stats) {
        setStats(res.stats);
      }
      setLoading(false);
    };

    loadStats();
  }, [toast]);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-neutral-400 mt-2">Loading statistics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Registrations',
      value: stats.totalUsers,
      description: 'Registered users in portal',
      icon: Users,
      color: 'text-neutral-500 bg-neutral-50 dark:bg-neutral-800/50',
    },
    {
      title: 'Active Interns',
      value: stats.totalInterns,
      description: 'Profiles uploaded details',
      icon: CheckCircle,
      color: 'text-brand bg-brand/5 dark:bg-brand/10',
    },
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      description: 'Awaiting initial approval',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Overview Dashboard</h2>
          <p className="text-sm text-neutral-500">Live statistics and management utilities.</p>
        </div>
        <div className="flex items-center gap-2">
          <LinkItem href="/admin/interns/new">
            <Button size="sm" className="flex items-center gap-1.5 cursor-pointer">
              <Plus className="w-4 h-4" />
              Add Intern Manually
            </Button>
          </LinkItem>
        </div>
      </div>

      {/* Counters Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="p-6 border border-neutral-100 dark:border-neutral-800">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                    {card.title}
                  </span>
                  <span className="text-3xl font-extrabold block mt-2 text-neutral-800 dark:text-neutral-50">
                    {card.value}
                  </span>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs text-neutral-400 mt-4">{card.description}</p>
            </Card>
          );
        })}
      </div>

      {/* Quick Action Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between h-48">
          <div>
            <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-base">Intern Profiles</h3>
            <p className="text-sm text-neutral-400 mt-2">
              View, search, filter, and modify details of all registered candidates and active interns.
            </p>
          </div>
          <div className="mt-4">
            <LinkItem href="/admin/interns" className="inline-block">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 group cursor-pointer">
                <span>Manage Interns</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </LinkItem>
          </div>
        </Card>

        <Card className="p-6 border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex flex-col justify-between h-48">
          <div>
            <h3 className="font-bold text-neutral-800 dark:text-neutral-200 text-base">Admin Credentials</h3>
            <p className="text-sm text-neutral-400 mt-2">
              Ensure portal security by periodically modifying your administrator dashboard entry password.
            </p>
          </div>
          <div className="mt-4">
            <LinkItem href="/admin/profile" className="inline-block">
              <Button variant="outline" size="sm" className="flex items-center gap-1.5 group cursor-pointer">
                <span>Edit Profile Password</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </LinkItem>
          </div>
        </Card>
      </div>
    </div>
  );
}
