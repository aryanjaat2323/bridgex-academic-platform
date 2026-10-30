import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { DoubtDetail, DoubtStatus } from '../../types';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { UrgencyBadge } from '../../components/ui/UrgencyBadge';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  Paperclip,
  Send,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  FileCheck
} from 'lucide-react';

const LIFECYCLE_STEPS: DoubtStatus[] = ['pending', 'seen', 'queued', 'answered', 'resolved'];

export const DoubtDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role } = useAuth();
  const [doubt, setDoubt] = useState<DoubtDetail | null>(null);
  const [replyText, setReplyText] = useState('');
  const [publishToRepo, setPublishToRepo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDoubt = async () => {
    if (!id) return;
    try {
      const data = await api.getDoubtDetail(Number(id));
      setDoubt(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load doubt details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDoubt();
  }, [id]);

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !doubt) return;
    setSubmitting(true);
    try {
      const isFaculty = role === 'faculty' || role === 'admin';
      await api.addResponse(doubt.id, replyText, isFaculty, publishToRepo);
      setReplyText('');
      await loadDoubt();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!doubt) return;
    setActionLoading(true);
    try {
      await api.updateDoubtStatus(doubt.id, newStatus);
      await loadDoubt();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (error || !doubt) {
    return (
      <div className="p-8 text-center space-y-4">
        <div className="text-red-600 font-semibold text-base">{error || 'Doubt not found'}</div>
        <Link to="/" className="text-xs font-bold text-brand-blue hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const currentStepIndex = LIFECYCLE_STEPS.indexOf(doubt.status.toLowerCase() as DoubtStatus);
  const isFacultyOrAdmin = role === 'faculty' || role === 'admin';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Navigation & Status Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to={role === 'faculty' ? '/faculty/queue' : '/student/doubts'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-muted hover:text-brand-blue transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {role === 'faculty' ? 'Faculty Queue' : 'My Doubts'}</span>
        </Link>

        {isFacultyOrAdmin && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-brand-muted mr-1">Update Status:</span>
            {doubt.status !== 'seen' && doubt.status === 'pending' && (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('seen')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-200"
              >
                Mark Seen
              </button>
            )}
            {doubt.status !== 'queued' && doubt.status !== 'resolved' && (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('queued')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition-colors border border-purple-200"
              >
                Add to Queue
              </button>
            )}
            {doubt.status !== 'resolved' && (
              <button
                disabled={actionLoading}
                onClick={() => handleStatusChange('resolved')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Mark Resolved
              </button>
            )}
          </div>
        )}
      </div>

      {/* 48-Hour SLA Breach Banner */}
      {doubt.is_escalated && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-2">
              <span>Automatic 48-Hour SLA Escalation Triggered</span>
              <span className="px-2 py-0.5 bg-red-200 text-red-800 rounded text-[10px]">High Priority</span>
            </div>
            <p className="text-xs text-red-800 mt-1">
              {doubt.escalation_reason || 'This doubt exceeded the 48-hour response threshold without resolution.'} Department administration has been notified.
            </p>
          </div>
        </div>
      )}

      {/* Interactive Visual Lifecycle Tracker */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-6">
          Live Academic Doubt Lifecycle
        </h3>
        <div className="relative flex items-center justify-between">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-brand-border z-0"></div>
          <div
            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-blue transition-all duration-500 z-0"
            style={{ width: `${(Math.max(0, currentStepIndex) / (LIFECYCLE_STEPS.length - 1)) * 100}%` }}
          ></div>

          {LIFECYCLE_STEPS.map((step, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div key={step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                    isCurrent
                      ? 'bg-brand-blue text-white ring-4 ring-blue-100 shadow-md scale-110'
                      : isCompleted
                      ? 'bg-brand-navy text-white'
                      : 'bg-white border-2 border-brand-border text-brand-muted'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                </div>
                <span
                  className={`mt-2 text-xs capitalize font-semibold ${
                    isCurrent ? 'text-brand-blue' : isCompleted ? 'text-brand-navy' : 'text-brand-muted'
                  }`}
                >
                  {step}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Doubt Header & Question Body */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-6">
        <div className="border-b border-brand-border pb-5">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono text-xs font-bold text-brand-blue bg-brand-blue-light px-2.5 py-1 rounded-md">
              {doubt.reference_id}
            </span>
            <span className="text-xs font-semibold text-brand-navy bg-brand-bg px-2.5 py-1 rounded-md border border-brand-border">
              {doubt.subject_code} - {doubt.subject_name}
            </span>
            <span className="text-xs font-medium text-brand-muted bg-gray-100 px-2.5 py-1 rounded-md">
              {doubt.topic}
            </span>
            <div className="ml-auto flex items-center gap-2">
              <UrgencyBadge urgency={doubt.urgency} />
              <StatusBadge status={doubt.status} isEscalated={doubt.is_escalated} />
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-brand-navy tracking-tight mt-2">
            {doubt.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-brand-muted">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-blue" />
              <span>Student: <strong>{doubt.student_name}</strong> ({doubt.student_roll || 'Sec A'})</span>
            </span>
            <span>•</span>
            <span>Assigned Faculty: <strong>{doubt.faculty_name || 'General Faculty Pool'}</strong></span>
            <span>•</span>
            <span>Submitted: {new Date(doubt.created_at).toLocaleString()}</span>
          </div>
        </div>

        {/* Detailed Question Description */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-brand-muted">
            Question Statement
          </div>
          <div className="p-5 rounded-xl bg-brand-bg border border-brand-border text-sm text-brand-text leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
            {doubt.description}
          </div>

          {doubt.context_notes && (
            <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-brand-navy">
              <span className="font-bold">Student Context Notes:</span> {doubt.context_notes}
            </div>
          )}

          {doubt.attachment_url && (
            <div className="flex items-center gap-2 pt-2">
              <Paperclip className="w-4 h-4 text-brand-blue" />
              <a
                href={doubt.attachment_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-brand-blue hover:underline inline-flex items-center gap-1"
              >
                <span>View Attachment Reference</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Discussion & Answers Thread */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-brand-border pb-4">
          <h2 className="text-base font-bold text-brand-navy">
            Academic Discussion Thread ({doubt.responses?.length || 0})
          </h2>
          {doubt.is_published && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Published to Knowledge Base</span>
            </span>
          )}
        </div>

        {doubt.responses?.length === 0 ? (
          <div className="p-8 text-center text-xs text-brand-muted">
            No responses yet. Faculty will provide a verified answer shortly.
          </div>
        ) : (
          <div className="space-y-4">
            {doubt.responses.map((resp) => {
              const isFacultyResp = resp.is_faculty_answer;
              return (
                <div
                  key={resp.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isFacultyResp
                      ? 'bg-teal-50/40 border-teal-200'
                      : 'bg-brand-bg border-brand-border'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={resp.author_avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                        alt={resp.author_name}
                        className="w-7 h-7 rounded-full border border-brand-border bg-white"
                      />
                      <div>
                        <div className="text-xs font-bold text-brand-navy flex items-center gap-1.5">
                          <span>{resp.author_name}</span>
                          {isFacultyResp && (
                            <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-2 py-0.2 rounded-full flex items-center gap-0.5">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Verified Faculty Answer</span>
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-brand-muted">
                          {new Date(resp.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-brand-text leading-relaxed whitespace-pre-wrap font-sans">
                    {resp.content}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Reply Submission Form */}
        <form onSubmit={handleSendResponse} className="pt-4 border-t border-brand-border space-y-3">
          <label className="block text-xs font-bold text-brand-navy">
            {isFacultyOrAdmin ? 'Submit Verified Answer / Response' : 'Reply with Clarification'}
          </label>
          <textarea
            required
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder={
              isFacultyOrAdmin
                ? 'Provide structured explanation, algorithmic steps, or lecture references...'
                : 'Provide additional information requested by the professor...'
            }
            className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none leading-relaxed"
          />

          {isFacultyOrAdmin && (
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-brand-navy">
              <input
                type="checkbox"
                checked={publishToRepo}
                onChange={(e) => setPublishToRepo(e.target.checked)}
                className="rounded border-brand-border text-brand-blue focus:ring-brand-blue"
              />
              <span>Publish this solution to the institutional Solved Questions Repository</span>
            </label>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 flex items-center gap-2"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Posting...' : isFacultyOrAdmin ? 'Post Answer' : 'Send Clarification'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Audit History Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted">
          Audit Trail & Status History
        </h3>
        <div className="divide-y divide-brand-border text-xs">
          {doubt.timeline?.map((item) => (
            <div key={item.id} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-semibold text-brand-navy capitalize">{item.new_status}</span>
                <span className="text-brand-muted"> — {item.reason || 'Status update'}</span>
              </div>
              <div className="text-[11px] text-brand-muted">
                {item.changed_by_name || 'System'} • {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
