import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Doubt, Subject } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UrgencyBadge } from '../../components/ui/UrgencyBadge';
import {
  Search,
  Filter,
  Inbox,
  Merge,
  ArrowRight,
  Eye,
  ListPlus,
  CheckCircle2,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const FacultyQueuePage: React.FC = () => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [selectedUrgency, setSelectedUrgency] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Merge modal
  const [isMergeOpen, setIsMergeOpen] = useState(false);
  const [duplicateDoubt, setDuplicateDoubt] = useState<Doubt | null>(null);
  const [primaryDoubtId, setPrimaryDoubtId] = useState<number | ''>('');
  const [mergeNotes, setMergeNotes] = useState('');
  const [merging, setMerging] = useState(false);
  const [mergeMessage, setMergeMessage] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dList, sList] = await Promise.all([
        api.getDoubts({
          subject_id: selectedSubjectId ? Number(selectedSubjectId) : undefined,
          urgency: selectedUrgency || undefined,
          status: selectedStatus || undefined,
          search: search || undefined,
        }),
        api.getSubjects(),
      ]);
      setDoubts(dList);
      setSubjects(sList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedSubjectId, selectedUrgency, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleQuickStatus = async (doubtId: number, newStatus: string) => {
    try {
      await api.updateDoubtStatus(doubtId, newStatus);
      await loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleOpenMerge = (doubt: Doubt) => {
    setDuplicateDoubt(doubt);
    setPrimaryDoubtId('');
    setMergeNotes('');
    setMergeMessage(null);
    setIsMergeOpen(true);
  };

  const handleExecuteMerge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!duplicateDoubt || !primaryDoubtId) return;
    setMerging(true);
    try {
      await api.mergeDoubts(Number(primaryDoubtId), duplicateDoubt.id, mergeNotes);
      setMergeMessage('Doubt merged successfully! Original record preserved.');
      setTimeout(() => {
        setIsMergeOpen(false);
        loadData();
      }, 1000);
    } catch (err: any) {
      setMergeMessage(err.response?.data?.detail || 'Merge failed.');
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Faculty Doubt Queue</h1>
          <p className="text-xs text-brand-muted mt-1">
            Organize, prioritize, and resolve academic queries across your assigned subjects.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, student, or title..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
          >
            <option value="">All Assigned Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <select
            value={selectedUrgency}
            onChange={(e) => setSelectedUrgency(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
          >
            <option value="">All Urgencies</option>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="deadline_approaching">Deadline Approaching</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="seen">Seen</option>
            <option value="queued">Queued</option>
            <option value="answered">Answered</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Queue Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
          </div>
        ) : doubts.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Inbox className="w-10 h-10 text-brand-muted mx-auto" />
            <div className="text-sm font-semibold text-brand-navy">No doubts found</div>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">
              No pending questions match the current filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-text">
              <thead className="bg-brand-bg border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3.5 px-4">Doubt Ref</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Subject & Topic</th>
                  <th className="py-3.5 px-4">Question Summary</th>
                  <th className="py-3.5 px-4">Urgency</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {doubts.map((doubt) => (
                  <tr key={doubt.id} className="hover:bg-brand-bg transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-brand-blue">
                      {doubt.reference_id}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-brand-navy">{doubt.student_name}</div>
                      <div className="text-[10px] text-brand-muted">{doubt.student_roll || 'Sec A'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">{doubt.subject_name}</div>
                      <div className="text-[10px] text-brand-muted">{doubt.topic}</div>
                    </td>
                    <td className="py-3 px-4 max-w-xs truncate font-medium">
                      {doubt.title}
                    </td>
                    <td className="py-3 px-4">
                      <UrgencyBadge urgency={doubt.urgency} />
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={doubt.status} isEscalated={doubt.is_escalated} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {doubt.status === 'pending' && (
                          <button
                            onClick={() => handleQuickStatus(doubt.id, 'seen')}
                            className="p-1.5 rounded-lg border border-brand-border text-blue-600 hover:bg-blue-50"
                            title="Mark as Seen"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {doubt.status !== 'queued' && doubt.status !== 'resolved' && (
                          <button
                            onClick={() => handleQuickStatus(doubt.id, 'queued')}
                            className="p-1.5 rounded-lg border border-brand-border text-purple-600 hover:bg-purple-50"
                            title="Add to Working Queue"
                          >
                            <ListPlus className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenMerge(doubt)}
                          className="p-1.5 rounded-lg border border-brand-border text-amber-600 hover:bg-amber-50"
                          title="Merge Duplicate Query"
                        >
                          <Merge className="w-3.5 h-3.5" />
                        </button>
                        <Link
                          to={`/student/doubts/${doubt.id}`}
                          className="px-2.5 py-1 rounded-lg bg-brand-blue text-white font-semibold hover:bg-blue-600 inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Duplicate Merge Modal */}
      {isMergeOpen && duplicateDoubt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <div className="flex items-center gap-2 text-brand-navy font-bold text-base">
              <Merge className="w-5 h-5 text-amber-600" />
              <span>Merge Duplicate Query</span>
            </div>
            <p className="text-xs text-brand-muted">
              Select the primary canonical doubt. The duplicate doubt will be marked resolved and linked to the primary question without deleting the student's submission history.
            </p>

            {mergeMessage && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-brand-blue text-xs">
                {mergeMessage}
              </div>
            )}

            <form onSubmit={handleExecuteMerge} className="space-y-4">
              <div className="p-3 rounded-xl bg-brand-bg border border-brand-border text-xs">
                <span className="font-bold text-brand-navy">Duplicate Question:</span>
                <div className="font-semibold text-brand-blue mt-0.5">{duplicateDoubt.reference_id} — {duplicateDoubt.title}</div>
                <div className="text-[11px] text-brand-muted mt-0.5">Submitted by {duplicateDoubt.student_name}</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  Select Primary Resolved Doubt (Destination)
                </label>
                <select
                  required
                  value={primaryDoubtId}
                  onChange={(e) => setPrimaryDoubtId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
                >
                  <option value="">-- Choose Primary Question --</option>
                  {doubts
                    .filter((d) => d.id !== duplicateDoubt.id && d.subject_id === duplicateDoubt.subject_id)
                    .map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.reference_id} - {d.title.slice(0, 50)}... ({d.status.toUpperCase()})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  Merge Notes / Clarification for Student
                </label>
                <textarea
                  rows={3}
                  value={mergeNotes}
                  onChange={(e) => setMergeNotes(e.target.value)}
                  placeholder="e.g. This question was already explained in detail under BX-2026-1011."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsMergeOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={merging || !primaryDoubtId}
                  className="px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 disabled:opacity-50"
                >
                  {merging ? 'Merging...' : 'Confirm Duplicate Merge'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
