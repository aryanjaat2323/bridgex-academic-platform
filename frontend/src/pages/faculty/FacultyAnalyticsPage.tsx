import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { Clock, TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

export const FacultyAnalyticsPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await api.getFacultyAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
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
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Faculty Workload & Performance Analytics</h1>
        <p className="text-xs text-brand-muted mt-1">
          Monitor your average response times, resolution rates, and incoming query urgency patterns.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-xs font-semibold uppercase text-brand-muted">Assigned Doubts</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.total_assigned}</div>
          <div className="text-[11px] text-brand-muted mt-1">Total inquiries received</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-xs font-semibold uppercase text-amber-600">Pending Queue</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.pending_queue}</div>
          <div className="text-[11px] text-brand-muted mt-1">Awaiting answer</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-xs font-semibold uppercase text-brand-blue">Avg Turnaround</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.avg_response_hours}h</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">Within 48h SLA</div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
          <div className="text-xs font-semibold uppercase text-emerald-600">Resolved Doubts</div>
          <div className="text-2xl font-extrabold text-brand-navy mt-1">{kpis.resolved_count}</div>
          <div className="text-[11px] text-brand-muted mt-1">Completed inquiries</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Query Urgency Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.urgency_breakdown || []}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={4}
                >
                  {(analytics?.urgency_breakdown || []).map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
          <h3 className="text-sm font-bold text-brand-navy mb-4">Queries by Subject</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.subject_distribution || []}>
                <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#356AE6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
