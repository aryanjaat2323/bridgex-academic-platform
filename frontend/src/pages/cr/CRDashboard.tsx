import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Doubt, User } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UrgencyBadge } from '../../components/ui/UrgencyBadge';
import {
  Users,
  Forward,
  TrendingUp,
  Clock,
  CheckCircle,
  FileText,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const CRDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [classDoubts, setClassDoubts] = useState<Doubt[]>([]);
  const [facultyList, setFacultyList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Forwarding modal state
  const [forwardDoubtId, setForwardDoubtId] = useState<number | null>(null);
  const [targetFacultyId, setTargetFacultyId] = useState<number | ''>('');
  const [crNote, setCrNote] = useState('');
  const [forwarding, setForwarding] = useState(false);
  const [forwardMsg, setForwardMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [stats, doubts, fac] = await Promise.all([
        api.getCRAnalytics(),
        api.getDoubts(),
        api.getFacultyDirectory(),
      ]);
      setAnalytics(stats);
      setClassDoubts(doubts);
      setFacultyList(fac);
      if (fac.length > 0) setTargetFacultyId(fac[0].id);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleForwardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forwardDoubtId || !targetFacultyId) return;
    setForwarding(true);
    try {
      await api.forwardDoubt(forwardDoubtId, Number(targetFacultyId), crNote);
      setForwardMsg('Doubt forwarded to faculty member successfully with CR endorsement.');
      setTimeout(() => {
        setForwardDoubtId(null);
        setCrNote('');
        loadData();
      }, 1000);
    } catch (err: any) {
      setForwardMsg(err.response?.data?.detail || 'Forwarding failed.');
    } finally {
      setForwarding(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Class Representative Portal • {kpis.class_section || 'Section A'}
          </div>
          <h1 className="text-2xl font-bold text-brand-navy mt-1">
            Welcome, {user?.full_name} (CR) 📋
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Monitor class doubts, forward unresolved questions to professors, and track weekly trends.
          </p>
        </div>

        <Link
          to="/cr/queries"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Forward className="w-4 h-4" />
          <span>Forward Class Queries</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-xs font-semibold uppercase text-brand-muted">Class Inquiries</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.total_class_doubts}</div>
          <div className="text-[11px] text-brand-muted mt-1">From students in section</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-xs font-semibold uppercase text-amber-600">Unresolved Queries</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.pending_doubts}</div>
          <div className="text-[11px] text-brand-muted mt-1">Pending review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-xs font-semibold uppercase text-emerald-600">Resolved Doubts</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.resolved_doubts}</div>
          <div className="text-[11px] text-brand-muted mt-1">Answers published</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-xs font-semibold uppercase text-red-600">Escalated Queries</div>
          <div className="text-2xl font-extrabold text-red-600 mt-1">{kpis.escalated_doubts}</div>
          <div className="text-[11px] text-brand-muted mt-1">SLA breached queries</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Subject Query Volume in Class</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.subject_distribution || []}>
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Top Raised Topics (Midterm Prep)</h3>
          <div className="space-y-3">
            {(analytics?.frequent_topics || []).map((t: any, index: number) => (
              <div key={index} className="p-3 rounded-xl bg-brand-bg border border-brand-border flex items-center justify-between text-xs">
                <span className="font-semibold text-brand-navy">{t.topic}</span>
                <span className="font-bold text-brand-blue bg-blue-100/70 px-2 py-0.5 rounded-full">
                  {t.count} doubts
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Class Doubts Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Section Queries & Forwarding Queue</h2>
            <p className="text-xs text-brand-muted mt-0.5">Identify repeated queries and forward them to designated faculty</p>
          </div>
        </div>

        <div className="divide-y divide-brand-border">
          {classDoubts.map((doubt) => (
            <div key={doubt.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-bg transition-colors">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">
                    {doubt.reference_id}
                  </span>
                  <span className="text-xs font-semibold text-brand-navy">{doubt.subject_name} • {doubt.topic}</span>
                </div>
                <h4 className="text-sm font-semibold text-brand-navy mt-1 truncate">{doubt.title}</h4>
                <div className="flex items-center gap-3 mt-1 text-[11px] text-brand-muted">
                  <span>Student: <strong>{doubt.student_name}</strong></span>
                  <span>•</span>
                  <span>Assigned Faculty: {doubt.faculty_name || 'Unassigned'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={doubt.status} isEscalated={doubt.is_escalated} />
                <button
                  onClick={() => {
                    setForwardDoubtId(doubt.id);
                    setForwardMsg(null);
                  }}
                  className="px-3 py-1.5 rounded-lg border border-brand-border hover:bg-brand-blue hover:text-white text-xs font-semibold text-brand-navy transition-colors flex items-center gap-1.5"
                >
                  <Forward className="w-3.5 h-3.5" />
                  <span>Forward</span>
                </button>
                <Link
                  to={`/student/doubts/${doubt.id}`}
                  className="px-3 py-1.5 rounded-lg bg-brand-bg text-brand-navy hover:bg-gray-200 text-xs font-semibold"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Forward Modal */}
      {forwardDoubtId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <h3 className="text-base font-bold text-brand-navy flex items-center gap-2">
              <Forward className="w-5 h-5 text-brand-blue" />
              <span>Forward Doubt to Faculty</span>
            </h3>
            <p className="text-xs text-brand-muted">
              As Class Representative, you can route an urgent or class-wide doubt directly to a specific faculty member with an endorsement note.
            </p>

            {forwardMsg && (
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-brand-blue text-xs">
                {forwardMsg}
              </div>
            )}

            <form onSubmit={handleForwardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">
                  Target Faculty Member
                </label>
                <select
                  required
                  value={targetFacultyId}
                  onChange={(e) => setTargetFacultyId(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
                >
                  {facultyList.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.full_name} ({f.department_name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">
                  CR Endorsement Note
                </label>
                <textarea
                  rows={3}
                  value={crNote}
                  onChange={(e) => setCrNote(e.target.value)}
                  placeholder="e.g. Multiple students in Section A have expressed confusion on this topic for Assignment 2..."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setForwardDoubtId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forwarding}
                  className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-50"
                >
                  {forwarding ? 'Forwarding...' : 'Forward with CR Note'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
