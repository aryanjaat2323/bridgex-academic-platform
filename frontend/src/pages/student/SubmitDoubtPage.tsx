import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Subject, DuplicateMatch } from '../../types';
import {
  Send,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Paperclip,
  Search,
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';

export const SubmitDoubtPage: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [topic, setTopic] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'normal' | 'important' | 'deadline_approaching'>('normal');
  const [contextNotes, setContextNotes] = useState('');
  const [attachmentUrl, setAttachmentUrl] = useState('');

  // Duplicates state
  const [duplicates, setDuplicates] = useState<DuplicateMatch[]>([]);
  const [isCheckingDuplicates, setIsCheckingDuplicates] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const subs = await api.getSubjects();
        setSubjects(subs);
        if (subs.length > 0) setSelectedSubjectId(subs[0].id);
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    loadSubjects();
  }, []);

  // Debounced duplicate detection
  useEffect(() => {
    if (!title || title.trim().length < 5 || !selectedSubjectId) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsCheckingDuplicates(true);
      try {
        const matches = await api.checkDuplicates(title, topic, Number(selectedSubjectId));
        setDuplicates(matches);
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingDuplicates(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, topic, selectedSubjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) {
      setError('Please select a subject.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const created = await api.createDoubt({
        subject_id: Number(selectedSubjectId),
        topic,
        title,
        description,
        urgency,
        context_notes: contextNotes,
        attachment_url: attachmentUrl,
      });
      navigate(`/student/doubts/${created.id}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to submit doubt.');
    } finally {
      setLoading(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === Number(selectedSubjectId));

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Submit an Academic Doubt</h1>
        <p className="text-xs text-brand-muted mt-1">
          Provide structured details so the assigned faculty member can address your doubt accurately.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Submission Form */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-brand-border shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Subject Selector */}
            <div>
              <label className="block text-xs font-bold text-brand-navy mb-1.5">
                Subject & Course Mapping
              </label>
              <select
                required
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none bg-white font-medium"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name} ({sub.course_name || 'B.Tech'})
                  </option>
                ))}
              </select>
              {selectedSubject?.assigned_faculty_name && (
                <div className="flex items-center gap-1.5 mt-2 text-xs text-brand-blue bg-blue-50/70 px-3 py-1.5 rounded-lg border border-blue-100">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>
                    Auto-routing to: <strong>{selectedSubject.assigned_faculty_name}</strong>
                  </span>
                </div>
              )}
            </div>

            {/* Topic */}
            <div>
              <label className="block text-xs font-bold text-brand-navy mb-1.5">
                Topic / Unit Module
              </label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Graph Algorithms, Virtual Memory Paging, B+ Trees"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
              />
            </div>

            {/* Title */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-brand-navy">
                  Question Title (Concise Summary)
                </label>
                {isCheckingDuplicates && (
                  <span className="text-[11px] text-brand-blue flex items-center gap-1">
                    <Search className="w-3 h-3 animate-spin" />
                    <span>Checking duplicates...</span>
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. How does Fibonacci heap improve Dijkstra's algorithm time complexity?"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
              />
            </div>

            {/* Detailed Description */}
            <div>
              <label className="block text-xs font-bold text-brand-navy mb-1.5">
                Detailed Explanation & Steps Tried
              </label>
              <textarea
                required
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the concept you're struggling with, textbook reference, or formula where you got stuck..."
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none leading-relaxed"
              />
            </div>

            {/* Urgency Level */}
            <div>
              <label className="block text-xs font-bold text-brand-navy mb-2">
                Urgency Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                <label
                  className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                    urgency === 'normal'
                      ? 'border-brand-blue bg-brand-blue-light/50 text-brand-blue font-semibold ring-1 ring-brand-blue'
                      : 'border-brand-border hover:bg-gray-50 text-brand-muted text-xs'
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value="normal"
                    checked={urgency === 'normal'}
                    onChange={() => setUrgency('normal')}
                    className="sr-only"
                  />
                  <div className="text-xs font-bold">Normal</div>
                  <div className="text-[10px] mt-0.5">Standard SLA (48h)</div>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                    urgency === 'important'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 font-semibold ring-1 ring-amber-500'
                      : 'border-brand-border hover:bg-gray-50 text-brand-muted text-xs'
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value="important"
                    checked={urgency === 'important'}
                    onChange={() => setUrgency('important')}
                    className="sr-only"
                  />
                  <div className="text-xs font-bold">Important</div>
                  <div className="text-[10px] mt-0.5">Prioritized queue</div>
                </label>

                <label
                  className={`p-3 rounded-xl border cursor-pointer text-center transition-all ${
                    urgency === 'deadline_approaching'
                      ? 'border-red-500 bg-red-50 text-red-800 font-semibold ring-1 ring-red-500'
                      : 'border-brand-border hover:bg-gray-50 text-brand-muted text-xs'
                  }`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value="deadline_approaching"
                    checked={urgency === 'deadline_approaching'}
                    onChange={() => setUrgency('deadline_approaching')}
                    className="sr-only"
                  />
                  <div className="text-xs font-bold">Deadline Close</div>
                  <div className="text-[10px] mt-0.5">Immediate highlight</div>
                </label>
              </div>
            </div>

            {/* Additional Context & Attachment URL */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  Attachment Link (Image / PDF / Drive)
                </label>
                <div className="relative">
                  <Paperclip className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                  <input
                    type="url"
                    value={attachmentUrl}
                    onChange={(e) => setAttachmentUrl(e.target.value)}
                    placeholder="https://drive.google.com/..."
                    className="w-full pl-9 pr-3.5 py-2.5 text-sm rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-brand-navy mb-1.5">
                  Additional Notes (Optional)
                </label>
                <input
                  type="text"
                  value={contextNotes}
                  onChange={(e) => setContextNotes(e.target.value)}
                  placeholder="e.g. Question 4 from Tutorial Sheet 3"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-brand-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Doubt...' : 'Submit Academic Doubt'}</span>
            </button>
          </form>
        </div>

        {/* Sidebar: Intelligent Duplicate Detection Live Box */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-brand-border shadow-sm">
            <div className="flex items-center gap-2 text-brand-navy font-bold text-sm mb-2">
              <Sparkles className="w-4 h-4 text-brand-blue" />
              <span>Smart Duplicate Detector</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              BridgeX compares your inquiry against previously answered faculty explanations in real-time.
            </p>

            {duplicates.length > 0 ? (
              <div className="mt-4 space-y-3">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                  Potential Matches Found ({duplicates.length})
                </div>

                {duplicates.map((match) => (
                  <div
                    key={match.id}
                    className="p-3 rounded-xl border border-brand-border hover:border-brand-blue transition-colors bg-brand-bg text-left"
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold text-brand-muted">
                      <span>{match.reference_id}</span>
                      <span className="text-brand-blue">
                        {Math.round(match.similarity_score * 100)}% match
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-brand-navy mt-1 line-clamp-2">
                      {match.title}
                    </div>
                    {match.answer_preview && (
                      <p className="text-[11px] text-brand-muted mt-1 italic line-clamp-2 bg-white p-1.5 rounded border border-gray-100">
                        "{match.answer_preview}"
                      </p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {match.has_answer ? '✓ Answered' : 'Pending'}
                      </span>
                      <Link
                        to={`/student/doubts/${match.id}`}
                        target="_blank"
                        className="text-[11px] font-bold text-brand-blue hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-4 rounded-xl bg-brand-bg border border-dashed border-brand-border text-center text-xs text-brand-muted">
                Start typing your doubt title and topic to see matching questions.
              </div>
            )}
          </div>

          <div className="bg-brand-blue-light/50 p-4 rounded-2xl border border-blue-200 text-xs text-brand-navy space-y-2">
            <div className="font-bold flex items-center gap-1.5">
              <Info className="w-4 h-4 text-brand-blue" />
              <span>Submission Guidelines</span>
            </div>
            <ul className="list-disc list-inside space-y-1 text-brand-muted text-[11px]">
              <li>Keep titles focused on the specific sub-concept.</li>
              <li>Include your code or formula attempt in the description.</li>
              <li>Only mark 'Deadline Close' if submission is within 24 hours.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
