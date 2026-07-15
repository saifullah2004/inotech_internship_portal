'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminGetInterns, adminDecideRequest } from '@/lib/actions/intern';
import { adminGetSessions } from '@/lib/actions/session';
import { useToast } from '@/components/providers/ToastProvider';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Loader2, Search, FileWarning, Eye, UserPlus, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminInternListItem {
  id: number;
  name: string;
  email: string;
  applicationStatus: string;
  createdAt: string;
  university: string | null;
  department: string | null;
  sessionId?: number | null;
  sessionName?: string | null;
  missingDocs: string[];
  latestRequest: {
    id: number;
    userId: number;
    status: string;
    requestedAt: Date;
    decidedAt: Date | null;
    decidedBy: number | null;
  } | null;
}

export default function InternsListPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [interns, setInterns] = useState<AdminInternListItem[]>([]);
  const [sessions, setSessions] = useState<{ id: number; sessionName: string }[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('all');
  const [decisionPendingId, setDecisionPendingId] = useState<number | null>(null);

  const handleDecision = async (internId: number, decision: 'approved' | 'declined') => {
    setDecisionPendingId(internId);
    const res = await adminDecideRequest(internId, decision);
    setDecisionPendingId(null);
    if (res.error) {
      toast.error(res.error);
    } else {
      toast.success(`Intern request successfully ${decision === 'approved' ? 'approved' : 'declined'}!`);
      const updatedList = await adminGetInterns();
      if (updatedList.interns) {
        setInterns(updatedList.interns as AdminInternListItem[]);
      }
    }
  };
  
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'pending_approval', 'declined', 'submitted'
  const [missingDocsOnly, setMissingDocsOnly] = useState(false); // filter interns missing recommendationLetter/policeVerification

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, missingDocsOnly, selectedSessionId]);

  // Load saved session filter, sessions, and status filter
  useEffect(() => {
    const savedSession = localStorage.getItem('inotech_session_filter');
    if (savedSession) {
      setSelectedSessionId(savedSession);
    }

    const savedStatus = localStorage.getItem('inotech_status_filter');
    if (savedStatus && ['all', 'pending_approval', 'declined', 'submitted'].includes(savedStatus)) {
      setStatusFilter(savedStatus);
    }

    const loadSessions = async () => {
      const res = await adminGetSessions();
      if (res.success && res.sessions) {
        setSessions(res.sessions);
      }
    };
    loadSessions();
  }, []);

  useEffect(() => {
    const loadInterns = async () => {
      const res = await adminGetInterns();
      if (res.error) {
        toast.error(res.error);
      } else if (res.interns) {
        setInterns(res.interns as AdminInternListItem[]);
      }
      setLoading(false);
    };

    loadInterns();
  }, [toast]);

  const handleSessionFilterChange = (id: string) => {
    setSelectedSessionId(id);
    localStorage.setItem('inotech_session_filter', id);
  };

  const handleTabChange = (key: string) => {
    setStatusFilter(key);
    localStorage.setItem('inotech_status_filter', key);
  };

  // Filter & Search Logic
  const filteredInterns = interns.filter((intern) => {
    // 1. Text Search match
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      intern.name.toLowerCase().includes(searchLower) ||
      intern.email.toLowerCase().includes(searchLower) ||
      (intern.university && intern.university.toLowerCase().includes(searchLower));

    // 2. Status Match
    const matchesStatus =
      statusFilter === 'all' || intern.applicationStatus === statusFilter;

    // 3. Missing Documents Match
    const matchesMissingDocs =
      !missingDocsOnly || (intern.applicationStatus === 'submitted' && intern.missingDocs.length > 0);

    // 4. Session Match
    const matchesSession =
      selectedSessionId === 'all' ||
      (intern.sessionId !== undefined && String(intern.sessionId) === selectedSessionId);

    return matchesSearch && matchesStatus && matchesMissingDocs && matchesSession;
  });

  // Calculate Pagination Variables
  const totalItems = filteredInterns.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const activePage = Math.min(currentPage, totalPages);
  
  const startIndex = (activePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedInterns = filteredInterns.slice(startIndex, startIndex + pageSize);

  if (loading) {
    return (
      <div className="h-64 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand" />
        <p className="text-sm text-neutral-400 mt-2">Loading interns list...</p>
      </div>
    );
  }

  const tabFilters = [
    { key: 'all', label: 'All Candidates' },
    { key: 'pending_approval', label: 'Pending Requests' },
    { key: 'declined', label: 'Declined' },
    { key: 'submitted', label: 'Active Interns' },
  ];

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Interns Directory</h2>
          <p className="text-sm text-neutral-500">Manage request lifecycles, view documents, and add interns manually.</p>
        </div>
        <div>
          <Link href="/admin/interns/new">
            <Button size="sm" className="flex items-center gap-1.5 cursor-pointer">
              <UserPlus className="w-4 h-4" />
              Add Manually
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <Card className="p-4 border border-neutral-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-neutral-900">
        {/* Search */}
        <div className="relative flex-1 max-w-md w-full">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-neutral-400 pointer-events-none">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, or university..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-neutral-200 dark:border-neutral-800 rounded-lg text-sm bg-white dark:bg-neutral-950 focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
            <span>Session:</span>
            <select
              value={selectedSessionId}
              onChange={(e) => handleSessionFilterChange(e.target.value)}
              className="px-3 py-1.5 border border-neutral-200 dark:border-neutral-800 rounded-lg bg-white dark:bg-neutral-950 focus:outline-none text-neutral-700 dark:text-neutral-300 font-semibold cursor-pointer"
            >
              <option value="all">All Sessions</option>
              {sessions.map((session) => (
                <option key={session.id} value={String(session.id)}>
                  {session.sessionName}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider cursor-pointer">
            <input
              type="checkbox"
              checked={missingDocsOnly}
              onChange={(e) => setMissingDocsOnly(e.target.checked)}
              className="accent-brand cursor-pointer"
            />
            <span className="flex items-center gap-1">
              <FileWarning className="w-3.5 h-3.5 text-amber-600" />
              Missing Documents
            </span>
          </label>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 flex gap-4 overflow-x-auto pb-px">
        {tabFilters.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            className={`py-2 px-1 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              statusFilter === tab.key
                ? 'border-brand text-brand'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Interns Table */}
      <Card className="border border-neutral-100 dark:border-neutral-800 overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-neutral-50 dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800">
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400">Name</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400">Status</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400">Session</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400">University &amp; Dept</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400">Missing Documents</th>
              <th className="px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-neutral-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {paginatedInterns.length > 0 ? (
              paginatedInterns.map((intern) => (
                <tr
                  key={intern.id}
                  className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/30 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-250">{intern.name}</span>
                      <span className="text-xs text-neutral-400">{intern.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge status={intern.applicationStatus} />
                  </td>
                  <td className="px-6 py-4">
                    {intern.sessionName ? (
                      <span className="font-semibold text-neutral-700 dark:text-neutral-350">
                        {intern.sessionName}
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {intern.university ? (
                      <div className="flex flex-col text-neutral-600 dark:text-neutral-400">
                        <span className="font-medium">{intern.university}</span>
                        <span className="text-xs">{intern.department}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-neutral-400 italic">No details submitted</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {intern.applicationStatus === 'submitted' ? (
                      intern.missingDocs.length > 0 ? (
                        <div className="flex flex-col gap-0.5">
                          {intern.missingDocs.map((doc: string) => (
                            <span
                              key={doc}
                              className="text-xs text-amber-600 dark:text-amber-500 font-medium flex items-center gap-1"
                            >
                              • {doc === 'recommendationLetter' ? 'Rec. Letter' : 'Police Verification'}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-emerald-600 dark:text-emerald-500 font-semibold">
                          Completed
                        </span>
                      )
                    ) : (
                      <span className="text-xs text-neutral-400 italic">Not uploaded yet</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {intern.applicationStatus === 'pending_approval' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={decisionPendingId === intern.id}
                            onClick={() => handleDecision(intern.id, 'approved')}
                            className="border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                            Accept
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={decisionPendingId === intern.id}
                            onClick={() => handleDecision(intern.id, 'declined')}
                            className="border-rose-500 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1 text-rose-500" />
                            Decline
                          </Button>
                        </>
                      )}
                      <Link href={`/admin/interns/${intern.id}`}>
                        <Button variant="outline" size="sm" className="flex items-center gap-1 cursor-pointer">
                          <Eye className="w-3.5 h-3.5" />
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-neutral-400 italic">
                  No interns found matching the criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination Controls */}
        {totalItems > 0 && (
          <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500">
            {/* Page Size Adjuster with + and - */}
            <div className="flex items-center gap-2">
              <span>Show limit:</span>
              <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-900 border border-neutral-250 dark:border-neutral-800 rounded-lg p-0.5">
                <button
                  type="button"
                  disabled={pageSize <= 5}
                  onClick={() => setPageSize(Math.max(5, pageSize - 5))}
                  className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer font-bold w-6 h-6 flex items-center justify-center text-sm"
                  title="Show less"
                >
                  -
                </button>
                <span className="font-semibold px-2 min-w-8 text-center text-neutral-800 dark:text-neutral-250">
                  {pageSize}
                </span>
                <button
                  type="button"
                  disabled={pageSize >= 50}
                  onClick={() => setPageSize(Math.min(50, pageSize + 5))}
                  className="p-1 rounded-md hover:bg-neutral-200 dark:hover:bg-neutral-800 disabled:opacity-30 cursor-pointer font-bold w-6 h-6 flex items-center justify-center text-sm"
                  title="Show more"
                >
                  +
                </button>
              </div>
              <span className="text-neutral-450">per page</span>
            </div>

            {/* Showing details */}
            <div>
              Showing <span className="font-semibold text-neutral-700 dark:text-neutral-350">{startIndex + 1}</span> to{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-350">{endIndex}</span> of{' '}
              <span className="font-semibold text-neutral-700 dark:text-neutral-350">{totalItems}</span> interns
            </div>

            {/* Pagination buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={activePage === 1}
                onClick={() => setCurrentPage(activePage - 1)}
                className="flex items-center gap-1 py-1 px-2.5 cursor-pointer text-xs"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </Button>
              <div className="font-medium text-neutral-700 dark:text-neutral-350">
                Page {activePage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage(activePage + 1)}
                className="flex items-center gap-1 py-1 px-2.5 cursor-pointer text-xs"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
