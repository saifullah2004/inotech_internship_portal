'use client';

import React, { useEffect, useState, useTransition, useCallback } from 'react';
import { adminGetSessions, adminCreateSession, adminUpdateSession, adminDeleteSession } from '@/lib/actions/session';
import { useToast } from '@/components/providers/ToastProvider';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import { Loader2, Plus, Calendar, Edit2, Trash2, Folder, Clock, Users, ArrowRight, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Session {
  id: number;
  sessionName: string;
  sessionCode: string | null;
  description: string | null;
  startDate: string;
  endDate: string;
  status: string;
  createdAt: string;
  totalInterns: number;
}

export default function SessionsPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Search & Pagination state
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Selected session for edit/delete
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  // Transitions
  const [createPending, startCreateTransition] = useTransition();
  const [editPending, startEditTransition] = useTransition();
  const [deletePending, startDeleteTransition] = useTransition();

  // Errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const loadSessions = useCallback(async () => {
    const res = await adminGetSessions();
    if (res.error) {
      toast.error(res.error);
    } else if (res.sessions) {
      setSessions(res.sessions);
    }
    setLoading(false);
  }, [toast]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Reset page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredSessions = sessions.filter((session) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      session.sessionName.toLowerCase().includes(searchLower) ||
      (session.sessionCode && session.sessionCode.toLowerCase().includes(searchLower))
    );
  });

  const totalItems = filteredSessions.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);
  
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedSessions = filteredSessions.slice(startIndex, startIndex + pageSize);

  // Form Validation
  const validateForm = (formData: FormData): boolean => {
    const errs: Record<string, string> = {};
    const sessionName = formData.get('sessionName') as string;
    const startDate = formData.get('startDate') as string;
    const endDate = formData.get('endDate') as string;

    if (!sessionName || !sessionName.trim()) {
      errs.sessionName = 'Session Name is required';
    }
    if (!startDate) {
      errs.startDate = 'Start Date is required';
    }
    if (!endDate) {
      errs.endDate = 'End Date is required';
    }

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        errs.endDate = 'End Date must be after the Start Date';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (!validateForm(formData)) return;

    startCreateTransition(async () => {
      const res = await adminCreateSession(formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Internship session created successfully!');
        setCreateModalOpen(false);
        loadSessions();
      }
    });
  };

  const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSession) return;
    const formData = new FormData(e.currentTarget);
    if (!validateForm(formData)) return;

    startEditTransition(async () => {
      const res = await adminUpdateSession(selectedSession.id, formData);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Internship session updated successfully!');
        setEditModalOpen(false);
        setSelectedSession(null);
        loadSessions();
      }
    });
  };

  const handleDeleteConfirm = () => {
    if (!selectedSession) return;

    startDeleteTransition(async () => {
      const res = await adminDeleteSession(selectedSession.id);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Session deleted successfully!');
        setDeleteConfirmOpen(false);
        setSelectedSession(null);
        loadSessions();
      }
    });
  };

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-neutral-400 mt-2">Loading internship sessions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Internship Sessions</h2>
        </div>
        <div>
          <Button
            size="sm"
            onClick={() => {
              setErrors({});
              setCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Session
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <Card className="p-4 border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900">
        <div className="relative max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by session name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm bg-white dark:bg-neutral-950 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </div>
      </Card>

      {/* Grid of Sessions */}
      {sessions.length === 0 ? (
        <Card className="border border-neutral-100 dark:border-neutral-800 p-12 text-center text-neutral-400">
          <Folder className="w-12 h-12 text-neutral-355 dark:text-neutral-750 mx-auto mb-3" />
          <h3 className="font-bold text-neutral-700 dark:text-neutral-300 mb-1 text-base">No Sessions Found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            There are no internship cohorts created yet. Click &ldquo;Create New Session&rdquo; to configure your first internship batch.
          </p>
        </Card>
      ) : filteredSessions.length === 0 ? (
        <Card className="border border-neutral-100 dark:border-neutral-800 p-12 text-center text-neutral-400">
          <Folder className="w-12 h-12 text-neutral-355 dark:text-neutral-750 mx-auto mb-3" />
          <h3 className="font-bold text-neutral-700 dark:text-neutral-300 mb-1 text-base">No Matching Sessions</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto leading-relaxed">
            No sessions match your search query &quot;{searchTerm}&quot;. Try adjusting your keywords.
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedSessions.map((session) => (
              <Card key={session.id} className="p-6 border border-neutral-100 dark:border-neutral-800 flex flex-col justify-between hover:shadow-md transition-shadow duration-200">
                <div className="space-y-4">
                  {/* Status and Icon */}
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-lg bg-brand/5 dark:bg-brand/10 text-brand transition-all duration-300 group-hover:bg-brand group-hover:text-white">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <Badge status={session.status} />
                  </div>

                  {/* Session Name & Code */}
                  <div>
                    <h3 className="text-lg font-bold text-black dark:text-white leading-snug">
                      {session.sessionName}
                    </h3>
                    {session.sessionCode && (
                      <span className="inline-block text-xs font-semibold px-2 py-0.5 bg-neutral-150 dark:bg-neutral-800 text-black dark:text-white rounded-md mt-1">
                        {session.sessionCode}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  {session.description ? (
                    <p className="text-sm text-black dark:text-white line-clamp-2 leading-relaxed">
                      {session.description}
                    </p>
                  ) : (
                    <p className="text-sm text-black dark:text-white italic">
                      No description provided.
                    </p>
                  )}

                  {/* Timeline & Interns Counts */}
                  <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-black dark:text-white flex items-center gap-1.5 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        Timeline
                      </span>
                      <span className="font-semibold text-black dark:text-white">
                        {new Date(session.startDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} - {new Date(session.endDate).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-black dark:text-white flex items-center gap-1.5 font-bold">
                        <Users className="w-3.5 h-3.5" />
                        Total Interns
                      </span>
                      <span className="font-bold text-black dark:text-white">
                        {session.totalInterns}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 border-t border-neutral-100 dark:border-neutral-800 pt-4 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSelectedSession(session);
                      setErrors({});
                      setEditModalOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 text-xs py-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    fullWidth
                    onClick={() => {
                      setSelectedSession(session);
                      setDeleteConfirmOpen(true);
                    }}
                    className="flex items-center justify-center gap-1.5 border-rose-200 dark:border-rose-905 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs py-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 px-2">
              <span className="text-xs text-neutral-400">
                Showing <span className="font-semibold">{startIndex + 1}</span> to{' '}
                <span className="font-semibold">{endIndex}</span> of{' '}
                <span className="font-semibold">{totalItems}</span> items
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activePage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={activePage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className="flex items-center gap-1 cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Create Internship Session"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <Input
            label="Session Name *"
            id="sessionName"
            name="sessionName"
            placeholder="e.g. Summer Internship 2026"
            error={errors.sessionName}
            required
          />
          <Input
            label="Session Code"
            id="sessionCode"
            name="sessionCode"
            placeholder="e.g. SI-26"
            error={errors.sessionCode}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date *"
              id="startDate"
              name="startDate"
              type="date"
              error={errors.startDate}
              required
            />
            <Input
              label="End Date *"
              id="endDate"
              name="endDate"
              type="date"
              error={errors.endDate}
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Provide a brief description about the session..."
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors duration-150"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
              Status
            </label>
            <select
              id="status"
              name="status"
              className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors duration-150 cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createPending}
            >
              Create Session
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      {selectedSession && (
        <Modal
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedSession(null);
          }}
          title={`Edit Session: ${selectedSession.sessionName}`}
        >
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <Input
              label="Session Name *"
              id="sessionName"
              name="sessionName"
              defaultValue={selectedSession.sessionName}
              placeholder="e.g. Summer Internship 2026"
              error={errors.sessionName}
              required
            />
            <Input
              label="Session Code"
              id="sessionCode"
              name="sessionCode"
              defaultValue={selectedSession.sessionCode || ''}
              placeholder="e.g. SI-26"
              error={errors.sessionCode}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Start Date *"
                id="startDate"
                name="startDate"
                type="date"
                defaultValue={selectedSession.startDate.split('T')[0]}
                error={errors.startDate}
                required
              />
              <Input
                label="End Date *"
                id="endDate"
                name="endDate"
                type="date"
                defaultValue={selectedSession.endDate.split('T')[0]}
                error={errors.endDate}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={3}
                defaultValue={selectedSession.description || ''}
                placeholder="Provide a brief description about the session..."
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors duration-150"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={selectedSession.status}
                className="w-full px-3.5 py-2.5 rounded-lg border text-sm bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand transition-colors duration-150 cursor-pointer"
              >
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedSession(null);
                }}
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

      {/* Delete Confirmation Modal */}
      {selectedSession && (
        <Modal
          isOpen={deleteConfirmOpen}
          onClose={() => {
            setDeleteConfirmOpen(false);
            setSelectedSession(null);
          }}
          title="Confirm Deletion"
        >
          <div className="space-y-4">
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Are you sure you want to delete the session <strong>{selectedSession.sessionName}</strong>? This action cannot be undone.
            </p>
            {selectedSession.totalInterns > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 rounded-lg text-xs font-medium">
                Warning: There are {selectedSession.totalInterns} intern(s) assigned to this session. Deleting this session will permanently delete all these interns along with all their profiles, details, request files, and database records. This action cannot be undone.
              </div>
            )}

            <div className="flex justify-end gap-2.5 pt-4 border-t border-neutral-100 dark:border-neutral-800 mt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setSelectedSession(null);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handleDeleteConfirm}
                isLoading={deletePending}
                className="bg-rose-600 hover:bg-rose-700 text-white"
              >
                Delete Session
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
