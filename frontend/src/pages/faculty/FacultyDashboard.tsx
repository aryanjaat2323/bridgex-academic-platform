import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Doubt } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UrgencyBadge } from '../../components/ui/UrgencyBadge';
import {
  Inbox,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  ArrowRight,
  TrendingUp,
  Layers,
  Sparkles
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

export const FacultyDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [pendingDoubts, setPendingDoubts] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [stats, doubts] = await Promise.all([
          api.getFacultyAnalytics(),
          api.getDoubts(),
        ]);
        setAnalytics(stats);
        setPendingDoubts(doubts.filter((d) => d.status !== 'resolved').slice(0, 6));
      } catch (err) {
        console.error('Failed to load faculty dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {
    total_assigned: 0,
    pending_queue: 0,
    resolved_count: 0,
    escalated_count: 0,
    avg_response_hours: 0,
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 border border-brand-border shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
            Faculty Portal • {user?.office_room || 'Academic Block'}
          </div>
          <h1 className="text-2xl font-bold text-brand-navy mt-1">
            Welcome, {user?.full_name} 👩‍🏫
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Department of {user?.department_name || 'Computer Science & Engineering'} • Emp ID: {user?.employee_id || 'FAC-082'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            to="/faculty/queue"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm"
          >
            <Inbox className="w-4 h-4" />
            <span>Open Doubt Queue</span>
          </Link>
          <Link
            to="/faculty/appointments"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-50 text-purple-700 text-xs font-semibold hover:bg-purple-100 transition-colors border border-purple-200"
          >
            <Calendar className="w-4 h-4" />
            <span>Consultation Schedule</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-brand-muted">
            <span className="text-xs font-semibold uppercase">Assigned Doubts</span>
            <Layers className="w-4 h-4 text-brand-blue" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-brand-navy">
            {kpis.total_assigned}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">Across your courses</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-semibold uppercase">Pending Queue</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-brand-navy">
            {kpis.pending_queue}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">Requires answer</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-brand-blue">
            <span className="text-xs font-semibold uppercase">Avg Response Time</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-brand-navy">
            {kpis.avg_response_hours}h
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Well within 48h SLA</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="flex items-center justify-between text-red-600">
            <span className="text-xs font-semibold uppercase">48h Escalations</span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-red-600">
            {kpis.escalated_count}
          </div>
          <div className="text-[11px] text-brand-muted mt-1">Breached response limit</div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Pending Doubt Urgency Breakdown</h3>
          {analytics?.urgency_breakdown?.length > 0 ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.urgency_breakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {analytics.urgency_breakdown.map((entry: any, index: number) => (
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
              No pending doubts in queue.
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Course Query Volume</h3>
          {analytics?.subject_distribution?.length > 0 ? (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.subject_distribution}>
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-60 flex items-center justify-center text-xs text-brand-muted">
              No course query records to display.
            </div>
          )}
        </div>
      </div>

      {/* Priority Queue Overview */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Priority Doubt Queue</h2>
            <p className="text-xs text-brand-muted mt-0.5">Queries awaiting your review or response</p>
          </div>
          <Link
            to="/faculty/queue"
            className="text-xs font-semibold text-brand-blue hover:underline inline-flex items-center gap-1"
          >
            <span>Full Queue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingDoubts.length === 0 ? (
          <div className="p-8 text-center text-sm text-brand-muted">
            All assigned doubts have been resolved. Excellent work!
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {pendingDoubts.map((doubt) => (
              <div
                key={doubt.id}
                className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-brand-bg transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">
                      {doubt.reference_id}
                    </span>
                    <span className="text-xs font-semibold text-brand-navy">
                      {doubt.subject_name} • {doubt.topic}
                    </span>
                  </div>
                  <h4 className="text-sm font-semibold text-brand-navy mt-1 truncate">
                    {doubt.title}
                  </h4>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-brand-muted">
                    <span>Student: {doubt.student_name} ({doubt.student_roll || 'Sec A'})</span>
                    <span>•</span>
                    <span>Submitted: {new Date(doubt.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <UrgencyBadge urgency={doubt.urgency} />
                  <StatusBadge status={doubt.status} isEscalated={doubt.is_escalated} />
                  <Link
                    to={`/student/doubts/${doubt.id}`}
                    className="px-3 py-1.5 rounded-lg bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm ml-2"
                  >
                    Answer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
