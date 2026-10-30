import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Doubt } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UrgencyBadge } from '../../components/ui/UrgencyBadge';
import {
  Users,
  ShieldAlert,
  Clock,
  CheckCircle,
  BarChart3,
  Layers,
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [escalations, setEscalations] = useState<Doubt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [stats, esc] = await Promise.all([
          api.getAdminAnalytics(),
          api.getEscalatedDoubts(),
        ]);
        setAnalytics(stats);
        setEscalations(esc);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

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
            Institutional Administration & Academic Operations
          </div>
          <h1 className="text-2xl font-bold text-brand-navy mt-1">
            Executive Academic Oversight 🏛️
          </h1>
          <p className="text-xs text-brand-muted mt-1">
            Monitor institution-wide SLA compliance, faculty workload distribution, and unresolved bottlenecks.
          </p>
        </div>

        <Link
          to="/admin/escalations"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Review 48h Escalations ({kpis.escalated_doubts || 0})</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-[11px] font-semibold uppercase text-brand-muted">Total Students</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.total_students}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-[11px] font-semibold uppercase text-brand-muted">Total Faculty</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.total_faculty}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-[11px] font-semibold uppercase text-brand-blue">Total Queries</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.total_doubts}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-[11px] font-semibold uppercase text-amber-600">Pending Queue</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.pending_doubts}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-[11px] font-semibold uppercase text-emerald-600">Resolved Rate</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.overall_resolution_rate}%</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 bg-red-50/40 shadow-sm">
          <div className="text-[11px] font-semibold uppercase text-red-700">48h SLA Breaches</div>
          <div className="text-2xl font-extrabold text-red-600 mt-1">{kpis.escalated_doubts}</div>
        </div>
      </div>

      {/* Faculty Workload and Performance Leaderboard */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-brand-navy">Faculty Response & Workload Comparison</h2>
            <p className="text-xs text-brand-muted mt-0.5">Assigned inquiries, pending queues, and resolution throughput</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-brand-text">
            <thead className="bg-brand-bg border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Faculty Member</th>
                <th className="py-3 px-4">Assigned Doubts</th>
                <th className="py-3 px-4">Pending Queue</th>
                <th className="py-3 px-4">Resolved Doubts</th>
                <th className="py-3 px-4">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {(analytics?.faculty_performance || []).map((f: any, idx: number) => (
                <tr key={idx} className="hover:bg-brand-bg transition-colors">
                  <td className="py-3 px-4 font-bold text-brand-navy">{f.faculty_name}</td>
                  <td className="py-3 px-4 font-medium">{f.assigned}</td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      {f.pending} pending
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{f.resolved}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-blue rounded-full"
                          style={{ width: `${f.resolution_rate}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-[11px] text-brand-navy">{f.resolution_rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Escalation Queue Card */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        <div className="p-5 border-b border-brand-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-600" />
            <div>
              <h2 className="text-base font-bold text-brand-navy">Active 48-Hour SLA Escalations</h2>
              <p className="text-xs text-brand-muted mt-0.5">Queries exceeding institutional response SLA threshold</p>
            </div>
          </div>
          <Link
            to="/admin/escalations"
            className="text-xs font-semibold text-brand-blue hover:underline"
          >
            Manage Escalations
          </Link>
        </div>

        {escalations.length === 0 ? (
          <div className="p-8 text-center text-xs text-emerald-700 font-semibold">
            ✓ Zero active SLA breaches! All faculty queues are responding within 48 hours.
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {escalations.map((doubt) => (
              <div key={doubt.id} className="p-4 flex items-center justify-between hover:bg-red-50/20 transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                      {doubt.reference_id}
                    </span>
                    <span className="text-xs font-semibold">{doubt.subject_name}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-brand-navy mt-1 truncate">{doubt.title}</h4>
                  <div className="text-xs text-brand-muted mt-1">
                    Assigned: <strong>{doubt.faculty_name}</strong> • Student: {doubt.student_name}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={doubt.status} isEscalated={true} />
                  <Link
                    to={`/student/doubts/${doubt.id}`}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700"
                  >
                    Investigate
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
