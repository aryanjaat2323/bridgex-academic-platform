import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Doubt } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UrgencyBadge } from '../../components/ui/UrgencyBadge';
import { ShieldAlert, RefreshCw, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AdminEscalationsPage: React.FC = () => {
  const [escalations, setEscalations] = useState<Doubt[]>([]);
  const [scanning, setScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadEscalations = async () => {
    try {
      const data = await api.getEscalatedDoubts();
      setEscalations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEscalations();
  }, []);

  const handleTriggerScan = async () => {
    setScanning(true);
    setScanMessage(null);
    try {
      const res = await api.triggerEscalationCheck(48);
      setScanMessage(res.message);
      await loadEscalations();
    } catch (err: any) {
      setScanMessage('Failed to run escalation check.');
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-brand-navy">48-Hour SLA Escalation Management</h1>
            <span className="text-xs font-bold text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full">
              SLA Control Room
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Automated monitoring identifies queries unanswered for over 48 hours and alerts departmental administration.
          </p>
        </div>

        <button
          onClick={handleTriggerScan}
          disabled={scanning}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-navy text-white text-xs font-semibold hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-50 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${scanning ? 'animate-spin' : ''}`} />
          <span>{scanning ? 'Scanning System...' : 'Trigger SLA Scan Now'}</span>
        </button>
      </div>

      {scanMessage && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-brand-blue flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{scanMessage}</span>
        </div>
      )}

      {/* Escalated Doubts List */}
      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
          </div>
        ) : escalations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <ShieldAlert className="w-10 h-10 text-emerald-600 mx-auto" />
            <div className="text-sm font-bold text-brand-navy">No Escalated Inquiries</div>
            <p className="text-xs text-brand-muted max-w-sm mx-auto">
              All academic doubts across the university are currently being answered within the 48-hour SLA timeline.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {escalations.map((doubt) => (
              <div
                key={doubt.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-red-50/20 transition-colors"
              >
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded">
                      {doubt.reference_id}
                    </span>
                    <span className="text-xs font-semibold text-brand-navy">
                      {doubt.subject_name} • {doubt.topic}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-brand-navy mt-1.5">{doubt.title}</h3>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-brand-muted">
                    <span>Student: <strong>{doubt.student_name}</strong></span>
                    <span>•</span>
                    <span>Assigned Faculty: <strong>{doubt.faculty_name}</strong></span>
                    <span>•</span>
                    <span className="text-red-600 font-semibold">
                      Reason: {doubt.escalation_reason || 'Exceeded 48-hour response limit'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <UrgencyBadge urgency={doubt.urgency} />
                  <StatusBadge status={doubt.status} isEscalated={true} />
                  <Link
                    to={`/student/doubts/${doubt.id}`}
                    className="px-3.5 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 shadow-sm"
                  >
                    Open Case
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
