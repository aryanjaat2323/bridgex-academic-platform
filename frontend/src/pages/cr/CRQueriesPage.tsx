import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Doubt } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UrgencyBadge } from '../../components/ui/UrgencyBadge';
import { Forward, Search, ArrowRight, Inbox } from 'lucide-react';

export const CRQueriesPage: React.FC = () => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.getDoubts({ search: search || undefined });
      setDoubts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Class Queries Oversight</h1>
        <p className="text-xs text-brand-muted mt-1">
          Monitor all academic queries raised by students in your class section.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
          </div>
        ) : doubts.length === 0 ? (
          <div className="p-12 text-center text-xs text-brand-muted">
            No class queries found.
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {doubts.map((doubt) => (
              <div key={doubt.id} className="p-4 flex items-center justify-between hover:bg-brand-bg transition-colors">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-brand-blue">{doubt.reference_id}</span>
                    <span className="text-xs font-semibold">{doubt.subject_name}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-brand-navy mt-1 truncate">{doubt.title}</h4>
                  <div className="text-xs text-brand-muted mt-1">
                    Student: {doubt.student_name} • Assigned: {doubt.faculty_name}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <UrgencyBadge urgency={doubt.urgency} />
                  <StatusBadge status={doubt.status} isEscalated={doubt.is_escalated} />
                  <Link
                    to={`/student/doubts/${doubt.id}`}
                    className="p-1.5 rounded-lg border border-brand-border hover:bg-brand-bg text-brand-navy"
                  >
                    <ArrowRight className="w-4 h-4" />
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
