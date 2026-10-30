import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Doubt } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UrgencyBadge } from '../../components/ui/UrgencyBadge';
import {
  PlusCircle,
  Clock,
  CheckCircle,
  HelpCircle,
  Calendar,
  BookOpen,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [recentDoubts, setRecentDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [stats, doubts] = await Promise.all([
          api.getStudentAnalytics(),
          api.getDoubts({ mine_only: true }),
        ]);
        setAnalytics(stats);
        setRecentDoubts(doubts.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {
    total_doubts: 0,
    pending_doubts: 0,
    answered_doubts: 0,
    resolved_doubts: 0,
    resolution_rate: 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            {todayStr} • Section {user?.section || 'A'}
          </div>
          <h1 className="text-2xl font-bold text-brand-navy mt-1">
            Welcome back, {user?.full_name}! 👋
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Department of {user?.department_name || 'Computer Science & Engineering'} • Roll No: {user?.roll_number || 'N/A'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/student/submit"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Submit Doubt</span>
          </Link>
          <Link
            to="/student/appointments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue-light text-brand-blue text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Calendar className="w-4 h-4" />
            <span>Book Consultation</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-semibold uppercase">Total Raised</span>
            <HelpCircle className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-brand-navy">
            {kpis.total_doubts}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">Academic queries</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold uppercase">In Progress</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-brand-navy">
            {kpis.pending_doubts}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">Pending or Queued</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-teal-600">
            <span className="text-xs font-semibold uppercase">Answered</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-brand-navy">
            {kpis.answered_doubts}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">Awaiting your review</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-semibold uppercase">Resolution Rate</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-brand-navy">
            {kpis.resolution_rate}%
          </div>
          <div className="text-[11px] text-brand-muted mt-1">{kpis.resolved_doubts} fully resolved</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Subject-wise Doubt Distribution</h3>
          {analytics?.subject_distribution?.length > 0 ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.subject_distribution}>
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#356AE6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-brand-muted">
              No doubt records found for subjects yet.
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Doubt Resolution Status</h3>
          {analytics?.status_distribution?.length > 0 ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.status_distribution}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {analytics.status_distribution.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-brand-muted">
              No status records to display.
            </div>
          )}
        </div>
      </div>

      {/* Recent Doubts Table */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Recent Doubt Submissions</h2>
            <p className="text-xs text-brand-muted mt-0.5">Track your submitted queries and faculty responses</p>
          </div>
          <Link
            to="/student/doubts"
            className="text-xs font-semibold text-brand-blue hover:underline inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentDoubts.length === 0 ? (
          <div className="p-8 text-center text-sm text-brand-muted">
            You haven't submitted any doubts yet.
          </div>
        ) : (
          <div className="divide-y divide-brand-border overflow-x-auto">
            {recentDoubts.map((doubt) => (
              <Link
                key={doubt.id}
                to={`/student/doubts/${doubt.id}`}
                className="p-4 flex items-center justify-between hover:bg-brand-bg transition-colors block"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">
                      {doubt.reference_id}
                    </span>
                    <span className="text-xs text-brand-muted font-medium">
                      {doubt.subject_name} • {doubt.topic}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-brand-navy mt-1 truncate">
                    {doubt.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-brand-muted">
                    <span>Assigned: {doubt.faculty_name || 'General Queue'}</span>
                    <span>•</span>
                    <span>{new Date(doubt.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
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
