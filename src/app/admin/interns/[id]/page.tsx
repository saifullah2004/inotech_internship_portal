'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { adminGetInternById, adminDecideRequest, adminUpdateInternDetails } from '@/lib/actions/intern';
import { adminGetSessions } from '@/lib/actions/session';
import { useToast } from '@/components/providers/ToastProvider';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import {
  Loader2,
  ArrowLeft,
  Calendar,
  GraduationCap,
  Phone,
  MapPin,
  User,
  FileText,
  CheckCircle,
  XCircle,
  FileWarning,
  ExternalLink,
  Edit,
} from 'lucide-react';
import Link from 'next/link';
import { User as PrismaUser, InternDetail, InternRequest } from '@prisma/client';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InternDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const toast = useToast();
  const [isPending, startTransition] = useTransition();

  const resolvedParams = React.use(params);
  const internId = parseInt(resolvedParams.id);

  // States
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<(PrismaUser & { 
    internDetails: InternDetail | null; 
    internRequests: InternRequest[];
    session?: { id: number; sessionName: string; status: string } | null;
  }) | null>(null);
  const [details, setDetails] = useState<InternDetail | null>(null);
  const [sessions, setSessions] = useState<{ id: number; sessionName: string }[]>([]);

  // Edit Modal States
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editErrors, setEditErrors] = useState<Record<string, string>>({});
  const [editPending, startEditTransition] = useTransition();

  // Load sessions on mount
  useEffect(() => {
    const loadSessions = async () => {
      const res = await adminGetSessions();
      if (res.success && res.sessions) {
        setSessions(res.sessions);
      }
    };
    loadSessions();
  }, []);

  const loadInternData = useCallback(async () => {
    const res = await adminGetInternById(internId);
    if (res.error) {
      toast.error(res.error);
      router.push('/admin/interns');
    } else if (res.intern) {
      setUser(res.intern as typeof user);
      setDetails(res.intern.internDetails);
    }
    setLoading(false);
  }, [internId, router, toast]);

  useEffect(() => {
    loadInternData();
  }, [loadInternData]);

  // Request Decision Action
  const handleDecision = (decision: 'approved' | 'declined') => {
    startTransition(async () => {
      const res = await adminDecideRequest(internId, decision);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(`Intern request successfully ${decision === 'approved' ? 'approved' : 'declined'}!`);
        loadInternData();
      }
    });
  };

  // Edit Form Submit Action
  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setEditErrors({});

    const formData = new FormData(e.currentTarget);
    const fullName = formData.get('fullName') as string;
    const fatherName = formData.get('fatherName') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const university = formData.get('university') as string;
    const department = formData.get('department') as string;
    const semester = formData.get('semester') as string;
    const cgpa = formData.get('cgpa') as string;
    const startDate = formData.get('startDate') as string;

    const errors: Record<string, string> = {};
    if (!fullName) {
      errors.fullName = 'Required';
    } else if (!/^[a-zA-Z\s]+$/.test(fullName)) {
      errors.fullName = 'Full Name can only contain letters and spaces';
    }
    if (!fatherName) errors.fatherName = 'Required';
    if (!phone) errors.phone = 'Required';
    if (!address) errors.address = 'Required';
    if (!university) errors.university = 'Required';
    if (!department) errors.department = 'Required';
    if (!semester) errors.semester = 'Required';
    
    const cgpaVal = parseFloat(cgpa);
    if (isNaN(cgpaVal) || cgpaVal < 0 || cgpaVal > 4) {
      errors.cgpa = 'CGPA must be 0.0 - 4.0';
    }
    if (!startDate) errors.startDate = 'Required';

    // Document validation
    const picture = formData.get('picture') as File | null;
    const cv = formData.get('cv') as File | null;
    const cnic = formData.get('cnic') as File | null;
    const recLetter = formData.get('recommendationLetter') as File | null;
    const policeCert = formData.get('policeVerification') as File | null;

    if (picture && picture.size > 0 && !picture.type.startsWith('image/')) {
      errors.picture = 'Must be an image file';
    }
    if (cv && cv.size > 0 && cv.type !== 'application/pdf') {
      errors.cv = 'Must be a PDF document';
    }
    if (cnic && cnic.size > 0 && !cnic.type.startsWith('image/') && cnic.type !== 'application/pdf') {
      errors.cnic = 'Must be an image or PDF document';
    }
    if (recLetter && recLetter.size > 0 && !recLetter.type.startsWith('image/') && recLetter.type !== 'application/pdf') {
      errors.recommendationLetter = 'Must be an image or PDF document';
    }
    if (policeCert && policeCert.size > 0 && !policeCert.type.startsWith('image/') && policeCert.type !== 'application/pdf') {
      errors.policeVerification = 'Must be an image or PDF document';
    }

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    startEditTransition(async () => {
      const res = await adminUpdateInternDetails(internId, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Intern details updated successfully!');
        setEditModalOpen(false);
        loadInternData();
      }
    });
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-neutral-400 mt-2">Loading intern details...</p>
      </div>
    );
  }

  if (!user || !details) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-neutral-400">
        <FileWarning className="w-8 h-8 mb-2" />
        <p>Profile not found or failed to load.</p>
      </div>
    );
  }

  // Pre-calculations
  const missingLetter = details && !details.recommendationLetterPath;
  const missingVerification = details && !details.policeVerificationPath;

  return (
    <div className="space-y-6">
      {/* Back button header */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/interns"
          className="flex items-center gap-1.5 text-sm font-semibold text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Interns Directory
        </Link>
      </div>

      {/* Main card */}
      <Card className="border border-neutral-100 dark:border-neutral-800">
        {/* Card Header Profile Banner */}
        <div className="p-6 md:p-8 bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            {details?.picturePath ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-brand bg-white shrink-0 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={details.picturePath}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-xl shrink-0">
                {user.name.charAt(0)}
              </div>
            )}
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
                {user.name}
              </h2>
              <span className="text-sm text-neutral-400 block mt-0.5">{user.email}</span>
            </div>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-400">Application Status:</span>
              <Badge status={user.applicationStatus} />
            </div>
            
            {/* Deciding Requests Action buttons */}
            {user.applicationStatus === 'pending_approval' && (
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isPending}
                  onClick={() => handleDecision('approved')}
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                >
                  <CheckCircle className="w-4 h-4 mr-1.5 text-emerald-500" />
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  isLoading={isPending}
                  onClick={() => handleDecision('declined')}
                  className="border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                >
                  <XCircle className="w-4 h-4 mr-1.5 text-rose-500" />
                  Decline
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Card Body Details */}
        <div className="p-6 md:p-8">
          {details ? (
            <div className="space-y-8">
              {/* Personal Details Row */}
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-brand" />
                    Personal &amp; Contact Info
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditModalOpen(true)}
                    className="h-8 flex items-center gap-1 text-xs"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    Edit Details
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-sm">
                  <div>
                    <span className="text-neutral-400 block">Father&apos;s Name</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {details.fatherName}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      Phone Number
                    </span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {details.phone}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Assigned Session</span>
                    <span className="font-semibold text-brand block mt-0.5">
                      {user.session ? user.session.sessionName : <span className="text-neutral-450 italic font-normal">None Assigned</span>}
                    </span>
                  </div>
                  <div className="md:col-span-3">
                    <span className="text-neutral-400 block flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Address
                    </span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200 leading-relaxed">
                      {details.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Academic Details Row */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5">
                  <GraduationCap className="w-4 h-4 text-brand" />
                  Academic History
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 text-sm">
                  <div>
                    <span className="text-neutral-400 block">University</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {details.university}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Department</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {details.department}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">Semester</span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {details.semester}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block">CGPA</span>
                    <span className="font-semibold text-brand text-base">
                      {details.cgpa.toFixed(2)} / 4.00
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-400 block flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      Requested Start Date
                    </span>
                    <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                      {new Date(details.startDate).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Grid */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-400 mb-4 pb-2 border-b border-neutral-100 dark:border-neutral-800 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-brand" />
                  Uploaded Documents
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Picture */}
                  <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-40">
                    <div>
                      <span className="text-xs font-bold text-neutral-400 block uppercase tracking-wider">Profile Picture</span>
                      <span className="text-xs text-neutral-500 mt-0.5 block truncate">{details.picturePath}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-neutral-50 dark:border-neutral-850">
                      <a href={details.picturePath} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" fullWidth className="text-xs flex items-center justify-center gap-1 cursor-pointer">
                          <ExternalLink className="w-3 h-3" />
                          View File
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* CV */}
                  <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-40">
                    <div>
                      <span className="text-xs font-bold text-neutral-400 block uppercase tracking-wider">Curriculum Vitae (CV)</span>
                      <span className="text-xs text-neutral-500 mt-0.5 block truncate">{details.cvPath}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-neutral-50 dark:border-neutral-850">
                      <a href={details.cvPath} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" fullWidth className="text-xs flex items-center justify-center gap-1 cursor-pointer">
                          <ExternalLink className="w-3 h-3" />
                          View PDF
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* CNIC */}
                  <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-40">
                    <div>
                      <span className="text-xs font-bold text-neutral-400 block uppercase tracking-wider">CNIC Copy</span>
                      <span className="text-xs text-neutral-500 mt-0.5 block truncate">{details.cnicPath}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-neutral-50 dark:border-neutral-850">
                      <a href={details.cnicPath} target="_blank" rel="noopener noreferrer" className="flex-1">
                        <Button variant="outline" size="sm" fullWidth className="text-xs flex items-center justify-center gap-1 cursor-pointer">
                          <ExternalLink className="w-3 h-3" />
                          View File
                        </Button>
                      </a>
                    </div>
                  </div>

                  {/* Recommendation Letter */}
                  <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-40">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-400 block uppercase tracking-wider">Rec. Letter</span>
                        {missingLetter ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Missing</span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Uploaded</span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500 mt-0.5 block truncate">
                        {missingLetter ? 'Not submitted by candidate' : details.recommendationLetterPath}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-neutral-50 dark:border-neutral-850">
                      {!missingLetter ? (
                        <a href={details.recommendationLetterPath ?? undefined} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" fullWidth className="text-xs flex items-center justify-center gap-1 cursor-pointer">
                            <ExternalLink className="w-3 h-3" />
                            View File
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline" size="sm" fullWidth disabled className="text-xs flex items-center justify-center gap-1">
                          No File Available
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Police Verification */}
                  <div className="p-4 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between h-40 sm:col-span-2">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-400 block uppercase tracking-wider">Police Verification Cert</span>
                        {missingVerification ? (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Missing</span>
                        ) : (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Uploaded</span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500 mt-0.5 block truncate">
                        {missingVerification ? 'Not submitted by candidate' : details.policeVerificationPath}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-4 pt-2 border-t border-neutral-50 dark:border-neutral-850">
                      {!missingVerification ? (
                        <a href={details.policeVerificationPath ?? undefined} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="outline" size="sm" fullWidth className="text-xs flex items-center justify-center gap-1 cursor-pointer">
                            <ExternalLink className="w-3 h-3" />
                            View File
                          </Button>
                        </a>
                      ) : (
                        <Button variant="outline" size="sm" fullWidth disabled className="text-xs flex items-center justify-center gap-1">
                          No File Available
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
              <FileWarning className="w-12 h-12 text-neutral-300 dark:text-neutral-700 mb-4" />
              <p className="text-sm text-center">
                This candidate has not uploaded their internship registration details yet.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Edit Details Modal */}
      {details && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          title="Edit Intern Details"
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Full Name"
              id="fullName"
              name="fullName"
              defaultValue={details.fullName}
              error={editErrors.fullName}
              required
            />
            <Input
              label="Father's Name"
              id="fatherName"
              name="fatherName"
              defaultValue={details.fatherName}
              error={editErrors.fatherName}
              required
            />
            <Input
              label="Phone Number"
              id="phone"
              name="phone"
              defaultValue={details.phone}
              error={editErrors.phone}
              required
            />
            <Input
              label="Address"
              id="address"
              name="address"
              defaultValue={details.address}
              error={editErrors.address}
              required
            />
            <Input
              label="University"
              id="university"
              name="university"
              defaultValue={details.university}
              error={editErrors.university}
              required
            />
            <Input
              label="Department"
              id="department"
              name="department"
              defaultValue={details.department}
              error={editErrors.department}
              required
            />
            <Input
              label="Semester"
              id="semester"
              name="semester"
              defaultValue={details.semester}
              error={editErrors.semester}
              required
            />
            <Input
              label="CGPA"
              id="cgpa"
              name="cgpa"
              type="number"
              step="0.01"
              defaultValue={details.cgpa}
              error={editErrors.cgpa}
              required
            />
            <Input
              label="StartDate"
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={new Date(details.startDate).toISOString().split('T')[0]}
              error={editErrors.startDate}
              required
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sessionId" className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                Assigned Session *
              </label>
              <select
                id="sessionId"
                name="sessionId"
                defaultValue={user.sessionId || ''}
                required
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand cursor-pointer"
              >
                <option value="" disabled>Select Internship Session</option>
                {sessions.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.sessionName}
                  </option>
                ))}
              </select>
            </div>

            {/* Documents Section */}
            <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">
                Update Documents (Optional)
              </h4>
              
              {/* Profile Picture */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  Profile Picture {details.picturePath && <span className="text-[10px] text-emerald-500 font-normal">(Uploaded)</span>}
                </label>
                <input
                  type="file"
                  name="picture"
                  accept="image/*"
                  className="w-full px-3 py-1.5 border rounded-lg border-neutral-200 dark:border-neutral-800 text-xs bg-white dark:bg-neutral-900 focus:outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-[10px] file:font-semibold cursor-pointer"
                />
                {editErrors.picture && (
                  <p className="text-[10px] text-rose-500 font-medium">{editErrors.picture}</p>
                )}
              </div>

              {/* CV */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  CV Document {details.cvPath && <span className="text-[10px] text-emerald-500 font-normal">(Uploaded)</span>}
                </label>
                <input
                  type="file"
                  name="cv"
                  accept="application/pdf"
                  className="w-full px-3 py-1.5 border rounded-lg border-neutral-200 dark:border-neutral-800 text-xs bg-white dark:bg-neutral-900 focus:outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-[10px] file:font-semibold cursor-pointer"
                />
                {editErrors.cv && (
                  <p className="text-[10px] text-rose-500 font-medium">{editErrors.cv}</p>
                )}
              </div>

              {/* CNIC */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  CNIC Copy {details.cnicPath && <span className="text-[10px] text-emerald-500 font-normal">(Uploaded)</span>}
                </label>
                <input
                  type="file"
                  name="cnic"
                  accept="image/*,application/pdf"
                  className="w-full px-3 py-1.5 border rounded-lg border-neutral-200 dark:border-neutral-800 text-xs bg-white dark:bg-neutral-900 focus:outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-[10px] file:font-semibold cursor-pointer"
                />
                {editErrors.cnic && (
                  <p className="text-[10px] text-rose-500 font-medium">{editErrors.cnic}</p>
                )}
              </div>

              {/* Recommendation Letter */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  Recommendation Letter {details.recommendationLetterPath && <span className="text-[10px] text-emerald-500 font-normal">(Uploaded)</span>}
                </label>
                <input
                  type="file"
                  name="recommendationLetter"
                  accept="image/*,application/pdf"
                  className="w-full px-3 py-1.5 border rounded-lg border-neutral-200 dark:border-neutral-800 text-xs bg-white dark:bg-neutral-900 focus:outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-[10px] file:font-semibold cursor-pointer"
                />
                {editErrors.recommendationLetter && (
                  <p className="text-[10px] text-rose-500 font-medium">{editErrors.recommendationLetter}</p>
                )}
              </div>

              {/* Police Verification */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                  Police Verification Certificate {details.policeVerificationPath && <span className="text-[10px] text-emerald-500 font-normal">(Uploaded)</span>}
                </label>
                <input
                  type="file"
                  name="policeVerification"
                  accept="image/*,application/pdf"
                  className="w-full px-3 py-1.5 border rounded-lg border-neutral-200 dark:border-neutral-800 text-xs bg-white dark:bg-neutral-900 focus:outline-none file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:bg-neutral-100 dark:file:bg-neutral-800 file:text-[10px] file:font-semibold cursor-pointer"
                />
                {editErrors.policeVerification && (
                  <p className="text-[10px] text-rose-500 font-medium">{editErrors.policeVerification}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={editPending}
              >
                Save Changes
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
