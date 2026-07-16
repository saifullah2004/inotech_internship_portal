'use client';

import React, { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreateInternManually } from '@/lib/actions/intern';
import { adminGetActiveSessions } from '@/lib/actions/session';
import { useToast } from '@/components/providers/ToastProvider';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AddInternManuallyPage() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sessions, setSessions] = useState<{ id: number; sessionName: string }[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');

  useEffect(() => {
    const loadActiveSessions = async () => {
      const res = await adminGetActiveSessions();
      if (res.success && res.sessions && res.sessions.length > 0) {
        setSessions(res.sessions);
        setSelectedSessionId(String(res.sessions[0].id));
      } else {
        toast.info('No active internship sessions found. Please create an active session first.');
      }
    };
    loadActiveSessions();
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});

    const formData = new FormData(e.currentTarget);
    
    // Client validations
    const validationErrors: Record<string, string> = {};
    const textFields = [
      'fullName',
      'email',
      'fatherName',
      'phone',
      'address',
      'university',
      'department',
      'semester',
      'cgpa',
      'startDate',
      'sessionId',
    ];

    textFields.forEach((field) => {
      if (!formData.get(field)) {
        validationErrors[field] = 'Required';
      }
    });

    const email = formData.get('email') as string;
    if (email && !email.includes('@')) {
      validationErrors.email = 'Invalid email';
    }

    const cgpaVal = parseFloat(formData.get('cgpa') as string);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 4) {
      validationErrors.cgpa = 'CGPA must be 0.0 - 4.0';
    }

    // Required files
    const picture = formData.get('picture') as File | null;
    const cv = formData.get('cv') as File | null;
    const cnic = formData.get('cnic') as File | null;

    if (!picture || picture.size === 0) validationErrors.picture = 'Required';
    else if (!picture.type.startsWith('image/')) validationErrors.picture = 'Must be an image';

    if (!cv || cv.size === 0) validationErrors.cv = 'Required';
    else if (cv.type !== 'application/pdf') validationErrors.cv = 'Must be a PDF';

    if (!cnic || cnic.size === 0) validationErrors.cnic = 'Required';
    else if (!cnic.type.startsWith('image/') && cnic.type !== 'application/pdf') {
      validationErrors.cnic = 'Must be an image or PDF';
    }

    // Optional files
    const rec = formData.get('recommendationLetter') as File | null;
    const police = formData.get('policeVerification') as File | null;
    
    if (rec && rec.size > 0 && !rec.type.startsWith('image/') && rec.type !== 'application/pdf') {
      validationErrors.recommendationLetter = 'Must be an image or PDF';
    }
    if (police && police.size > 0 && !police.type.startsWith('image/') && police.type !== 'application/pdf') {
      validationErrors.policeVerification = 'Must be an image or PDF';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast.error('Please resolve errors in the form');
      return;
    }

    startTransition(async () => {
      const res = await adminCreateInternManually(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Intern profile manually created successfully!');
        router.push(`/admin/interns/${res.userId}`);
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/interns"
          className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interns Directory
        </Link>
      </div>

      <div className="flex flex-col gap-1.5 mb-2">
        <h2 className="text-2xl font-bold tracking-tight">Add New Intern</h2>
        <p className="text-sm text-neutral-500">Manually insert a new candidate profile and documents into the database.</p>
      </div>

      <Card className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* Session Assignment */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-4 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
              Session Assignment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="sessionId" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Internship Session <span className="text-rose-500">*</span>
                </label>
                <select
                  id="sessionId"
                  name="sessionId"
                  value={selectedSessionId}
                  onChange={(e) => setSelectedSessionId(e.target.value)}
                  required
                  className={`w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand cursor-pointer ${
                    errors.sessionId ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500' : ''
                  }`}
                >
                  <option value="" disabled>Select Internship Session</option>
                  {sessions.map((s) => (
                    <option key={s.id} value={String(s.id)}>
                      {s.sessionName}
                    </option>
                  ))}
                </select>
                {errors.sessionId && (
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-405">
                    {errors.sessionId}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-4 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Full Name"
                id="fullName"
                name="fullName"
                required
                placeholder="Candidate's full name"
                error={errors.fullName}
              />
              <Input
                label="Email Address"
                id="email"
                name="email"
                type="email"
                required
                placeholder="candidate@example.com"
                error={errors.email}
              />
              <Input
                label="Father's Name"
                id="fatherName"
                name="fatherName"
                required
                placeholder="Father's full name"
                error={errors.fatherName}
              />
              <Input
                label="Phone Number"
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="03XXXXXXXXX"
                error={errors.phone}
              />
              <div className="md:col-span-2">
                <Input
                  label="Home Address"
                  id="address"
                  name="address"
                  required
                  placeholder="House number, Street, Area, City"
                  error={errors.address}
                />
              </div>
            </div>
          </div>

          {/* Academic Info */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-4 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
              Academic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="University"
                id="university"
                name="university"
                required
                placeholder="e.g. FAST, NUST"
                error={errors.university}
              />
              <Input
                label="Department"
                id="department"
                name="department"
                required
                placeholder="e.g. Computer Science"
                error={errors.department}
              />
              <Input
                label="Semester"
                id="semester"
                name="semester"
                required
                placeholder="e.g. 8th"
                error={errors.semester}
              />
              <Input
                label="CGPA"
                id="cgpa"
                name="cgpa"
                type="number"
                step="0.01"
                min="0"
                max="4"
                required
                placeholder="3.5"
                error={errors.cgpa}
              />
              <Input
                label="Desired Starting Date"
                id="startDate"
                name="startDate"
                type="date"
                required
                error={errors.startDate}
              />
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-black dark:text-white mb-4 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
              Upload Files
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Profile Picture <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  name="picture"
                  accept="image/*"
                  required
                  className="w-full px-3.5 py-2 border rounded-lg border-neutral-200 dark:border-neutral-800 text-sm bg-white dark:bg-neutral-900 focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-xs file:font-semibold"
                />
                {errors.picture && <p className="text-xs text-rose-500 font-medium">{errors.picture}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Curriculum Vitae (CV) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  name="cv"
                  accept="application/pdf"
                  required
                  className="w-full px-3.5 py-2 border rounded-lg border-neutral-200 dark:border-neutral-800 text-sm bg-white dark:bg-neutral-900 focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-xs file:font-semibold"
                />
                {errors.cv && <p className="text-xs text-rose-500 font-medium">{errors.cv}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  CNIC Copy <span className="text-rose-500">*</span>
                </label>
                <input
                  type="file"
                  name="cnic"
                  accept="image/*,application/pdf"
                  required
                  className="w-full px-3.5 py-2 border rounded-lg border-neutral-200 dark:border-neutral-800 text-sm bg-white dark:bg-neutral-900 focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-xs file:font-semibold"
                />
                {errors.cnic && <p className="text-xs text-rose-500 font-medium">{errors.cnic}</p>}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Recommendation Letter <span className="text-neutral-450 font-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  name="recommendationLetter"
                  accept="image/*,application/pdf"
                  className="w-full px-3.5 py-2 border rounded-lg border-neutral-200 dark:border-neutral-800 text-sm bg-white dark:bg-neutral-900 focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-xs file:font-semibold"
                />
                {errors.recommendationLetter && <p className="text-xs text-rose-500 font-medium">{errors.recommendationLetter}</p>}
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                  Police Verification Certificate <span className="text-neutral-450 font-normal">(Optional)</span>
                </label>
                <input
                  type="file"
                  name="policeVerification"
                  accept="image/*,application/pdf"
                  className="w-full px-3.5 py-2 border rounded-lg border-neutral-200 dark:border-neutral-800 text-sm bg-white dark:bg-neutral-900 focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-xs file:font-semibold"
                />
                {errors.policeVerification && <p className="text-xs text-rose-500 font-medium">{errors.policeVerification}</p>}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end pt-4">
            <Button
              type="submit"
              isLoading={isPending}
              className="px-8"
            >
              Add Intern Profile
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
