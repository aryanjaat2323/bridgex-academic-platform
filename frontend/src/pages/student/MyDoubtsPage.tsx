import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Doubt } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UrgencyBadge } from '../../components/ui/UrgencyBadge';
import {
  Search,
  Filter,
  PlusCircle,
  ArrowRight,
  Inbox,
  AlertTriangle,
  Clock
} from 'lucide-react';

export const MyDoubtsPage: React.FC = () => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadDoubts = async () => {
    setLoading(true);
    try {
      const data = await api.getDoubts({
        mine_only: true,
        search: search || undefined,
        status: statusFilter || undefined,
        urgency: urgencyFilter || undefined,
      });
      setDoubts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoubts();
  }, [statusFilter, urgencyFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDoubts();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">My Academic Doubts</h1>
          <p className="text-xs text-brand-muted mt-1">
            Track live response timelines, faculty answers, and clarification threads.
          </p>
        </div>

        <Link
          to="/student/submit"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Doubt</span>
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, topic, or ID..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="seen">Seen</option>
            <option value="queued">Queued</option>
            <option value="answered">Answered</option>
            <option value="resolved">Resolved</option>
          </select>

          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
          >
            <option value="">All Urgencies</option>
            <option value="normal">Normal</option>
            <option value="important">Important</option>
            <option value="deadline_approaching">Deadline Approaching</option>
          </select>
        </div>
      </div>

      {/* Doubts List */}
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
              You haven't submitted any questions matching these criteria.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {doubts.map((doubt) => (
              <Link
                key={doubt.id}
                to={`/student/doubts/${doubt.id}`}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-bg transition-colors block"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">
                      {doubt.reference_id}
                    </span>
                    <span className="text-xs font-semibold text-brand-navy">
                      {doubt.subject_code} - {doubt.subject_name}
                    </span>
                    <span className="text-xs text-brand-muted">•</span>
                    <span className="text-xs text-brand-muted">{doubt.topic}</span>
                  </div>

                  <h3 className="text-sm font-bold text-brand-navy mt-1.5 hover:text-brand-blue transition-colors">
                    {doubt.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-brand-muted">
                    <span>Assigned: <strong>{doubt.faculty_name || 'Department Pool'}</strong></span>
                    <span>•</span>
                    <span>Submitted: {new Date(doubt.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{doubt.response_count} response{doubt.response_count === 1 ? '' : 's'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                  <UrgencyBadge urgency={doubt.urgency} />
                  <StatusBadge status={doubt.status} isEscalated={doubt.is_escalated} />
                  <ArrowRight className="w-4 h-4 text-brand-muted" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
