import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { Doubt, Subject } from '../../types';
import {
  Search,
  BookCheck,
  ThumbsUp,
  Star,
  ExternalLink,
  Filter,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

export const SolvedRepositoryPage: React.FC = () => {
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);

  // Rating modal state
  const [ratingDoubtId, setRatingDoubtId] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const loadRepository = async () => {
    setLoading(true);
    try {
      const data = await api.getRepository({
        subject_id: selectedSubjectId ? Number(selectedSubjectId) : undefined,
        search: search || undefined,
        sort_by: sortBy,
      });
      setDoubts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchInit = async () => {
      try {
        const subs = await api.getSubjects();
        setSubjects(subs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInit();
  }, []);

  useEffect(() => {
    loadRepository();
  }, [selectedSubjectId, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadRepository();
  };

  const handleUpvote = async (id: number) => {
    try {
      const res = await api.upvoteQuestion(id);
      setDoubts((prev) =>
        prev.map((d) => (d.id === id ? { ...d, upvotes: res.upvotes } : d))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ratingDoubtId) return;
    setSubmittingRating(true);
    try {
      await api.rateAnswer(ratingDoubtId, selectedRating, feedback);
      setRatingDoubtId(null);
      setFeedback('');
      await loadRepository();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-brand-navy">Solved Questions Repository</h1>
            <span className="text-xs font-bold text-teal-800 bg-teal-100 px-2.5 py-0.5 rounded-full">
              Knowledge Base
            </span>
          </div>
          <p className="text-xs text-brand-muted mt-1">
            Search faculty-verified explanations, algorithmic solutions, and peer-rated answers.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search keywords, topics, or formulas..."
            className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
          />
        </form>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : '')}
            className="px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
          >
            <option value="">All Academic Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.code} - {s.name}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium"
          >
            <option value="recent">Most Recent</option>
            <option value="upvotes">Most Upvoted</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
        </div>
      ) : doubts.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-brand-border text-center space-y-3">
          <BookCheck className="w-10 h-10 text-brand-muted mx-auto" />
          <div className="text-sm font-semibold text-brand-navy">No solved questions found</div>
          <p className="text-xs text-brand-muted max-w-sm mx-auto">
            Try adjusting your search terms or subject filters to find verified solutions.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doubts.map((doubt) => (
            <div
              key={doubt.id}
              className="bg-white p-6 rounded-2xl border border-brand-border shadow-sm flex flex-col justify-between hover:border-brand-blue transition-all"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono font-bold text-brand-blue bg-blue-50 px-2 py-0.5 rounded">
                    {doubt.reference_id}
                  </span>
                  <span className="font-semibold text-brand-navy">
                    {doubt.subject_name} • {doubt.topic}
                  </span>
                </div>

                <h3 className="text-base font-bold text-brand-navy mt-1 leading-snug">
                  {doubt.title}
                </h3>

                <p className="text-xs text-brand-muted mt-2 line-clamp-3 leading-relaxed">
                  {doubt.description}
                </p>

                <div className="mt-4 pt-3 border-t border-brand-border flex items-center justify-between text-xs text-brand-muted">
                  <span>Answered by: <strong>{doubt.faculty_name || 'Department Faculty'}</strong></span>
                  {doubt.average_rating ? (
                    <span className="flex items-center gap-1 font-bold text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{doubt.average_rating} / 5.0</span>
                    </span>
                  ) : (
                    <span className="text-[11px] text-brand-muted">Not rated yet</span>
                  )}
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-brand-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleUpvote(doubt.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-border hover:bg-brand-bg text-xs font-semibold text-brand-navy transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5 text-brand-blue" />
                    <span>{doubt.upvotes}</span>
                  </button>

                  <button
                    onClick={() => setRatingDoubtId(doubt.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-brand-border hover:bg-brand-bg text-xs font-semibold text-brand-navy transition-colors"
                  >
                    <Star className="w-3.5 h-3.5 text-amber-500" />
                    <span>Rate</span>
                  </button>
                </div>

                <Link
                  to={`/student/doubts/${doubt.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-brand-blue hover:underline"
                >
                  <span>View Verified Solution</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {ratingDoubtId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-brand-border space-y-4">
            <h3 className="text-base font-bold text-brand-navy">Rate Solution Helpfulness</h3>
            <p className="text-xs text-brand-muted">
              How clear and effective was this faculty explanation?
            </p>

            <form onSubmit={handleRateSubmit} className="space-y-4">
              <div className="flex items-center justify-center gap-2 py-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSelectedRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= selectedRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-navy mb-1">
                  Optional Feedback
                </label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="What made this answer helpful or what could be improved?"
                  className="w-full p-2.5 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRatingDoubtId(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-brand-muted hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingRating}
                  className="px-4 py-2 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 disabled:opacity-50"
                >
                  {submittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
