import React from 'react';

interface BadgeProps {
  status: string;
  className?: string;
}

export default function Badge({ status, className = '' }: BadgeProps) {
  const normalizedStatus = status.toLowerCase();

  let styles = 'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
  let label = status;

  if (normalizedStatus === 'approved' || normalizedStatus === 'accepted' || normalizedStatus === 'success') {
    styles = 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/30';
    label = normalizedStatus === 'approved' ? 'Approved' : normalizedStatus === 'accepted' ? 'Accepted' : 'Success';
  } else if (normalizedStatus === 'declined' || normalizedStatus === 'rejected' || normalizedStatus === 'error') {
    styles = 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/30';
    label = normalizedStatus === 'declined' ? 'Declined' : normalizedStatus === 'rejected' ? 'Rejected' : 'Error';
  } else if (normalizedStatus === 'pending' || normalizedStatus === 'pending_approval' || normalizedStatus === 'warning') {
    styles = 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/30';
    label = normalizedStatus === 'pending_approval' ? 'Pending Approval' : normalizedStatus === 'pending' ? 'Pending' : 'Warning';
  } else if (normalizedStatus === 'not_submitted') {
    styles = 'bg-neutral-50 text-neutral-600 border-neutral-200 dark:bg-neutral-800/50 dark:text-neutral-400 dark:border-neutral-800';
    label = 'Not Submitted';
  } else if (normalizedStatus === 'submitted') {
    styles = 'bg-brand/5 text-brand border-brand/20 dark:bg-brand/10 dark:text-brand-light dark:border-brand/10';
    label = 'Submitted';
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles} ${className}`}
    >
      {label}
    </span>
  );
}
