'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  checkUserStatus,
  createPendingRequest,
  submitInternshipDetails,
  uploadMissingDocument,
} from '@/lib/actions/intern';
import { logoutUser } from '@/lib/actions/auth';
import { useToast } from '@/components/providers/ToastProvider';
import ThemeToggle from '@/components/ui/ThemeToggle';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { Loader2, LogOut, CheckCircle2, AlertTriangle, FileText, Upload } from 'lucide-react';
import { InternDetail } from '@prisma/client';

interface DashboardUser {
  id: number;
  name: string;
  email: string;
  role: string;
  applicationStatus: string;
}

export default function UserDashboard() {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();
  const [isLogoutPending, startLogoutTransition] = useTransition();
  
  // App states
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [details, setDetails] = useState<InternDetail | null>(null);
  
  // Form states
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Missing document upload states
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  // Fetch state on mount
  const fetchStatus = useCallback(async (showToast = false) => {
    const res = await checkUserStatus();
    if (res.error) {
      toast.error(res.error);
      return;
    }
    
    setUser(res.user as DashboardUser | null);
    setDetails(res.internDetails as InternDetail | null);

    if (showToast) {
      toast.success('Status synchronized');
    }

    // Auto trigger pending request generation if not_submitted
    if (res.user?.applicationStatus === 'not_submitted') {
      const initReq = await createPendingRequest();
      if (initReq.success && initReq.status) {
        setUser((prev) => prev ? { ...prev, applicationStatus: initReq.status as string } : null);
      }
    }
  }, [toast]);

  useEffect(() => {
    fetchStatus().then(() => setLoading(false));
  }, [fetchStatus]);

  // Poll status when in pending_approval
  useEffect(() => {
    if (user?.applicationStatus !== 'pending_approval') return;

    const interval = setInterval(() => {
      checkUserStatus().then((res) => {
        if (res.user && res.user.applicationStatus !== 'pending_approval') {
          setUser(res.user as DashboardUser | null);
          setDetails(res.internDetails);
          toast.info(`Application status updated: ${res.user.applicationStatus}`);
        }
      });
    }, 6000); // Check every 6 seconds

    return () => clearInterval(interval);
  }, [user?.applicationStatus, toast]);

  // Handle auto logout and redirect when declined
  useEffect(() => {
    if (user?.applicationStatus !== 'declined') return;

    const timeout = setTimeout(() => {
      logoutUser().then(() => {
        router.push('/login');
        router.refresh();
      });
    }, 5000); // 5 seconds wait

    return () => clearTimeout(timeout);
  }, [user?.applicationStatus, router]);

  // Handle Logout
  const handleLogout = () => {
    startLogoutTransition(async () => {
      await logoutUser();
      toast.success('Logged out successfully');
      router.push('/login');
      router.refresh();
    });
  };

  // Form Submission
  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormErrors({});
    
    const formData = new FormData(e.currentTarget);
    formData.set('termsAccepted', String(termsAccepted));

    // Client-side quick check
    const errors: Record<string, string> = {};
    const requiredTextFields = [
      'fullName',
      'fatherName',
      'phone',
      'address',
      'university',
      'department',
      'semester',
      'cgpa',
      'startDate',
    ];

    requiredTextFields.forEach((field) => {
      if (!formData.get(field)) {
        errors[field] = 'This field is required';
      }
    });

    const cgpaVal = parseFloat(formData.get('cgpa') as string);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 4.0) {
      errors.cgpa = 'CGPA must be a decimal between 0.0 and 4.0';
    }

    // Required files validation
    const picture = formData.get('picture') as File | null;
    const cv = formData.get('cv') as File | null;
    const cnic = formData.get('cnic') as File | null;

    if (!picture || picture.size === 0) errors.picture = 'Picture file is required';
    else if (!picture.type.startsWith('image/')) errors.picture = 'Must be an image file';

    if (!cv || cv.size === 0) errors.cv = 'CV document is required';
    else if (cv.type !== 'application/pdf') errors.cv = 'Must be a PDF document';

    if (!cnic || cnic.size === 0) errors.cnic = 'CNIC copy is required';
    else if (!cnic.type.startsWith('image/') && cnic.type !== 'application/pdf') {
      errors.cnic = 'Must be an image or PDF document';
    }

    // Optional files validations
    const recLetter = formData.get('recommendationLetter') as File | null;
    const policeCert = formData.get('policeVerification') as File | null;

    if (recLetter && recLetter.size > 0) {
      if (!recLetter.type.startsWith('image/') && recLetter.type !== 'application/pdf') {
        errors.recommendationLetter = 'Must be an image or PDF document';
      }
    }

    if (policeCert && policeCert.size > 0) {
      if (!policeCert.type.startsWith('image/') && policeCert.type !== 'application/pdf') {
        errors.policeVerification = 'Must be an image or PDF document';
      }
    }

    if (!termsAccepted) {
      errors.termsAccepted = 'You must accept the terms to proceed';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast.error('Please correct the errors in the form');
      return;
    }

    startTransition(async () => {
      const res = await submitInternshipDetails(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Your details have been uploaded successfully!');
        if (res.missingDocs) {
          toast.info(`Please remember to upload: ${res.missingDocs.join(', ')}`);
        }
        fetchStatus();
      }
    });
  };

  // Upload missing file action
  const handleUploadMissingDoc = async (e: React.FormEvent<HTMLFormElement>, type: string) => {
    e.preventDefault();
    setUploadingDoc(type);

    const formData = new FormData(e.currentTarget);
    formData.append('docType', type);

    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      toast.error('Please select a file to upload');
      setUploadingDoc(null);
      return;
    }

    const res = await uploadMissingDocument(formData);
    setUploadingDoc(null);

    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success('Document uploaded successfully!');
      fetchStatus();
    }
  };

  // Loading Shell
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
        <Loader2 className="w-10 h-10 animate-spin text-brand" />
        <p className="mt-4 text-sm text-neutral-500">Checking your application status...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 transition-colors">
      {/* Top Navbar */}
      <header className="bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo href="/dashboard" />
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end text-right">
              <span className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">{user?.name}</span>
              <span className="text-xs text-neutral-400">Intern</span>
            </div>
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              isLoading={isLogoutPending}
              onClick={handleLogout}
              className="flex items-center gap-1.5"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* STATE 1: PENDING APPROVAL */}
        {user?.applicationStatus === 'pending_approval' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Card className="max-w-md w-full p-8 flex flex-col items-center border border-amber-100 dark:border-amber-900/10">
              <div className="w-16 h-16 rounded-full bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center mb-6">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Request Submitted</h2>
              <Badge status="pending_approval" className="mb-4" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-6 leading-relaxed">
                Your request has been submitted. Please wait for admin approval. This page auto-polls for updates, but you can also check status manually.
              </p>
              <Button
                variant="primary"
                onClick={() => fetchStatus(true)}
                isLoading={isPending}
                fullWidth
              >
                Refresh Status
              </Button>
            </Card>
          </div>
        )}

        {/* STATE 2: DECLINED */}
        {user?.applicationStatus === 'declined' && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Card className="max-w-md w-full p-8 flex flex-col items-center border border-rose-100 dark:border-rose-900/10">
              <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/20 flex items-center justify-center mb-6">
                <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight mb-2">Request Declined</h2>
              <Badge status="declined" className="mb-4" />
              <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">
                Your request has been declined. You will be automatically redirected to the login page.
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                <span className="text-xs text-neutral-400">Clearing session...</span>
              </div>
            </Card>
          </div>
        )}

        {/* STATE 3: SUBMITTED (COMPLETED) */}
        {user?.applicationStatus === 'submitted' && (
          <div className="space-y-6">
            <Card className="p-8 border-emerald-100 dark:border-emerald-900/10">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/20 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Details Uploaded Successfully</h2>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    You have already uploaded your details. Thank you!
                  </p>
                </div>
              </div>

              {/* Submitted Details Overview */}
              {details && (
                <div className="border-t border-neutral-100 dark:border-neutral-800 pt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-4">Your Application Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-400 block">Full Name</span>
                      <span className="font-medium">{details.fullName}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">University</span>
                      <span className="font-medium">{details.university}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Department</span>
                      <span className="font-medium">{details.department}</span>
                    </div>
                    <div>
                      <span className="text-neutral-400 block">Starting Date</span>
                      <span className="font-medium">{new Date(details.startDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Missing Documents Handler Widget */}
            {details && (!details.recommendationLetterPath || !details.policeVerificationPath) && (
              <Card className="p-6 border border-amber-200 dark:border-amber-900/30 bg-amber-50/20 dark:bg-amber-950/10">
                <div className="flex items-start gap-3 mb-4">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-800 dark:text-amber-400">Missing Optional Documents</h3>
                    <p className="text-xs text-amber-700 dark:text-amber-500/90 mt-0.5">
                      Your details are saved, but the following optional document(s) are missing. Please upload them to complete your file.
                    </p>
                  </div>
                </div>

                <div className="space-y-4 mt-6">
                  {/* Recommendation Letter */}
                  {!details.recommendationLetterPath && (
                    <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-sm font-semibold flex items-center gap-1.5 text-neutral-700 dark:text-neutral-200">
                          <FileText className="w-4 h-4 text-brand" />
                          University Recommendation Letter
                        </span>
                        <span className="text-xs text-neutral-400 block mt-0.5">PDF or Image copy</span>
                      </div>
                      <form
                        onSubmit={(e) => handleUploadMissingDoc(e, 'recommendationLetter')}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="file"
                          name="file"
                          accept="image/*,application/pdf"
                          required
                          className="text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 dark:file:bg-neutral-800 dark:file:text-neutral-300 hover:file:bg-neutral-200 cursor-pointer"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          isLoading={uploadingDoc === 'recommendationLetter'}
                          className="flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload
                        </Button>
                      </form>
                    </div>
                  )}

                  {/* Police Verification */}
                  {!details.policeVerificationPath && (
                    <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <span className="text-sm font-semibold flex items-center gap-1.5 text-neutral-700 dark:text-neutral-200">
                          <FileText className="w-4 h-4 text-brand" />
                          Police Verification Certificate
                        </span>
                        <span className="text-xs text-neutral-400 block mt-0.5">PDF or Image copy</span>
                      </div>
                      <form
                        onSubmit={(e) => handleUploadMissingDoc(e, 'policeVerification')}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="file"
                          name="file"
                          accept="image/*,application/pdf"
                          required
                          className="text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-neutral-100 file:text-neutral-700 dark:file:bg-neutral-800 dark:file:text-neutral-300 hover:file:bg-neutral-200 cursor-pointer"
                        />
                        <Button
                          type="submit"
                          size="sm"
                          isLoading={uploadingDoc === 'policeVerification'}
                          className="flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          Upload
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* STATE 4: APPROVED - SHOW INTERNSHIP DETAILS FORM */}
        {user?.applicationStatus === 'approved' && (
          <div className="space-y-6">
            <div className="flex flex-col gap-1.5 mb-2">
              <h2 className="text-2xl font-bold tracking-tight">Internship Registration</h2>
              <p className="text-sm text-neutral-500">
                Congratulations on your approval. Please provide your academic details and documents to complete your onboarding.
              </p>
            </div>

            <Card className="p-6 md:p-8">
              <form onSubmit={handleFormSubmit} className="space-y-8" noValidate>
                {/* Section A: Personal Details */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label="Full Name"
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      placeholder="Your full name"
                      defaultValue={user?.name}
                      error={formErrors.fullName}
                    />

                    <Input
                      label="Father's Name"
                      id="fatherName"
                      name="fatherName"
                      type="text"
                      required
                      placeholder="Father's full name"
                      error={formErrors.fatherName}
                    />

                    <Input
                      label="Email Address"
                      id="email"
                      name="email"
                      type="email"
                      prefilledReadOnly
                      defaultValue={user?.email}
                    />

                    <Input
                      label="Phone Number"
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="03XXXXXXXXX"
                      error={formErrors.phone}
                    />

                    <div className="md:col-span-2">
                      <Input
                        label="Home Address"
                        id="address"
                        name="address"
                        type="text"
                        required
                        placeholder="House number, Street, Area, City"
                        error={formErrors.address}
                      />
                    </div>
                  </div>
                </div>

                {/* Section B: Academic Details */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
                    Academic Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <Input
                      label="University"
                      id="university"
                      name="university"
                      type="text"
                      required
                      placeholder="e.g. FAST, NUST, COMSATS"
                      error={formErrors.university}
                    />

                    <Input
                      label="Department"
                      id="department"
                      name="department"
                      type="text"
                      required
                      placeholder="e.g. Computer Science, Software Engineering"
                      error={formErrors.department}
                    />

                    <Input
                      label="Semester"
                      id="semester"
                      name="semester"
                      type="text"
                      required
                      placeholder="e.g. 6th, 7th"
                      error={formErrors.semester}
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
                      placeholder="e.g. 3.45"
                      error={formErrors.cgpa}
                    />

                    <Input
                      label="Desired Starting Date"
                      id="startDate"
                      name="startDate"
                      type="date"
                      required
                      error={formErrors.startDate}
                    />
                  </div>
                </div>

                {/* Section C: Documents Upload */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 pb-1.5 border-b border-neutral-100 dark:border-neutral-800">
                    Documents Upload
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Profile Picture */}
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
                      {formErrors.picture ? (
                        <p className="text-xs text-rose-500 font-medium">{formErrors.picture}</p>
                      ) : (
                        <span className="text-xs text-neutral-400">Upload clean professional passport-sized photo (JPEG/PNG)</span>
                      )}
                    </div>

                    {/* CV Upload */}
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
                      {formErrors.cv ? (
                        <p className="text-xs text-rose-500 font-medium">{formErrors.cv}</p>
                      ) : (
                        <span className="text-xs text-neutral-400">PDF document only</span>
                      )}
                    </div>

                    {/* CNIC Copy */}
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
                      {formErrors.cnic ? (
                        <p className="text-xs text-rose-500 font-medium">{formErrors.cnic}</p>
                      ) : (
                        <span className="text-xs text-neutral-400">PDF or Image copy</span>
                      )}
                    </div>

                    {/* University Recommendation Letter */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Recommendation Letter <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="file"
                        name="recommendationLetter"
                        accept="image/*,application/pdf"
                        className="w-full px-3.5 py-2 border rounded-lg border-neutral-200 dark:border-neutral-800 text-sm bg-white dark:bg-neutral-900 focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-xs file:font-semibold"
                      />
                      {formErrors.recommendationLetter ? (
                        <p className="text-xs text-rose-500 font-medium">{formErrors.recommendationLetter}</p>
                      ) : (
                        <span className="text-xs text-neutral-400">PDF or Image copy. Can upload later if missing.</span>
                      )}
                    </div>

                    {/* Police Verification */}
                    <div className="flex flex-col gap-1.5 md:col-span-2">
                      <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                        Police Verification Certificate <span className="text-neutral-400 font-normal">(Optional)</span>
                      </label>
                      <input
                        type="file"
                        name="policeVerification"
                        accept="image/*,application/pdf"
                        className="w-full px-3.5 py-2 border rounded-lg border-neutral-200 dark:border-neutral-800 text-sm bg-white dark:bg-neutral-900 focus:outline-none file:mr-3 file:py-1 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-xs file:font-semibold"
                      />
                      {formErrors.policeVerification ? (
                        <p className="text-xs text-rose-500 font-medium">{formErrors.policeVerification}</p>
                      ) : (
                        <span className="text-xs text-neutral-400">PDF or Image copy. Can upload later if missing.</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions Statement */}
                <div className="p-5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 space-y-4">
                  <h4 className="font-bold text-neutral-800 dark:text-neutral-200 text-sm">Terms &amp; Conditions of Internship Program</h4>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400 space-y-2 h-44 overflow-y-auto pr-2 border-b border-neutral-100 dark:border-neutral-850 pb-3">
                    <p><strong>1. Attendance &amp; Hours:</strong> Interns are required to maintain a consistent attendance record, adhering to standard working hours (9:00 AM - 5:00 PM, Monday through Friday) or as agreed upon with their mentor. Proper notice is required for any leave.</p>
                    <p><strong>2. Code of Conduct:</strong> Interns must perform tasks professionally, respect workplace protocols, maintain collaboration standards, and represent Inotech Solutions with integrity.</p>
                    <p><strong>3. Confidentiality &amp; NDA:</strong> All proprietary source code, systems documentation, client details, and company files accessed during the internship are strictly confidential and must not be copied or disclosed to third parties.</p>
                    <p><strong>4. Duration &amp; Extension Policy:</strong> The standard internship program runs for 3 months. Extension request approvals depend upon performance evaluations and business requirements.</p>
                    <p><strong>5. Certificate Issuance Conditions:</strong> Completion certificates are only awarded to interns who complete their program duration, submit all task files, and obtain satisfactory supervisor reviews.</p>
                    <p><strong>6. Termination Policy:</strong> Inotech Solutions (Pvt) Ltd reserves the right to terminate an internship immediately for violations of code of conduct, breach of NDAs, or poor performance.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="termsAccepted"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 cursor-pointer accent-brand"
                    />
                    <label htmlFor="termsAccepted" className="text-xs text-neutral-600 dark:text-neutral-400 cursor-pointer">
                      I have read and agree to the above terms and conditions, and I certify that all information and files uploaded are authentic and correct.
                    </label>
                  </div>
                  {formErrors.termsAccepted && (
                    <p className="text-xs text-rose-500 font-medium">{formErrors.termsAccepted}</p>
                  )}
                </div>

                {/* Form Button Action */}
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={!termsAccepted}
                    isLoading={isPending}
                    className="px-8"
                  >
                    Upload Details
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
