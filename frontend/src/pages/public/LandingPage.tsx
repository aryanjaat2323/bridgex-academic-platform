import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  Search,
  Calendar,
  Layers,
  CheckCircle,
  HelpCircle,
  Users,
  Award,
  Sparkles
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemo = async (role: 'student' | 'faculty' | 'cr' | 'admin') => {
    await demoLogin(role);
    if (role === 'student') navigate('/student/dashboard');
    else if (role === 'faculty') navigate('/faculty/dashboard');
    else if (role === 'cr') navigate('/cr/dashboard');
    else if (role === 'admin') navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-brand-blue selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <BrandLogo size="md" />
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-brand-text">
            <a href="#problem" className="hover:text-brand-blue transition-colors">The Problem</a>
            <a href="#how-it-works" className="hover:text-brand-blue transition-colors">How It Works</a>
            <a href="#features" className="hover:text-brand-blue transition-colors">Features</a>
            <a href="#testimonials" className="hover:text-brand-blue transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-brand-blue transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-semibold text-brand-text hover:text-brand-blue px-3 py-2 transition-colors"
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className="text-sm font-semibold text-white bg-brand-blue hover:bg-blue-600 px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-28 lg:pb-32 bg-gradient-to-b from-white via-brand-bg to-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-blue-light border border-blue-200 text-brand-blue text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Academic Doubt Resolution & Faculty Consultation Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-brand-navy tracking-tight max-w-4xl mx-auto leading-tight">
            Never Let a Doubt <br className="hidden sm:inline" />
            <span className="text-brand-blue">Go Unanswered.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-brand-muted max-w-2xl mx-auto leading-relaxed">
            BridgeX brings students and faculty together through structured academic communication,
            intelligent duplicate detection, and transparent 48-hour response tracking.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-blue text-white font-semibold shadow-lg shadow-blue-500/25 hover:bg-blue-600 transition-all transform hover:-translate-y-0.5"
            >
              <span>Explore Platform</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#how-it-works"
              className="px-6 py-3.5 rounded-xl bg-white border border-brand-border text-brand-navy font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              How It Works
            </a>
          </div>

          {/* Quick Demo Switcher Cards in Hero */}
          <div className="mt-12 pt-8 border-t border-brand-border/60 max-w-3xl mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-4">
              Instant One-Click Live Persona Demos:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleQuickDemo('student')}
                className="p-3 bg-white rounded-xl border border-brand-border hover:border-brand-blue text-left shadow-sm transition-all group"
              >
                <div className="text-xs font-bold text-brand-blue group-hover:underline">🎓 Student</div>
                <div className="text-xs font-medium text-brand-navy mt-1">Aarav Sharma</div>
                <div className="text-[10px] text-brand-muted">Submit & Track</div>
              </button>
              <button
                onClick={() => handleQuickDemo('faculty')}
                className="p-3 bg-white rounded-xl border border-brand-border hover:border-brand-blue text-left shadow-sm transition-all group"
              >
                <div className="text-xs font-bold text-purple-600 group-hover:underline">👩‍🏫 Faculty</div>
                <div className="text-xs font-medium text-brand-navy mt-1">Dr. Priya Raman</div>
                <div className="text-[10px] text-brand-muted">Queue & Resolve</div>
              </button>
              <button
                onClick={() => handleQuickDemo('cr')}
                className="p-3 bg-white rounded-xl border border-brand-border hover:border-brand-blue text-left shadow-sm transition-all group"
              >
                <div className="text-xs font-bold text-emerald-600 group-hover:underline">📋 Class Rep</div>
                <div className="text-xs font-medium text-brand-navy mt-1">Tanya Verma</div>
                <div className="text-[10px] text-brand-muted">Forward & Monitor</div>
              </button>
              <button
                onClick={() => handleQuickDemo('admin')}
                className="p-3 bg-white rounded-xl border border-brand-border hover:border-brand-blue text-left shadow-sm transition-all group"
              >
                <div className="text-xs font-bold text-red-600 group-hover:underline">🏛️ Admin / HOD</div>
                <div className="text-xs font-medium text-brand-navy mt-1">Dr. K. Venkat</div>
                <div className="text-[10px] text-brand-muted">48h SLA & Metrics</div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Statement Section */}
      <section id="problem" className="py-20 bg-white border-y border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-200">
              The Academic Crisis
            </span>
            <h2 className="text-3xl font-bold text-brand-navy mt-4 tracking-tight">
              Why Traditional Doubt Resolution Fails
            </h2>
            <p className="mt-3 text-brand-muted text-base">
              Informal channels create communication black holes, faculty burnout, and student anxiety.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-14">
            <div className="p-6 rounded-2xl bg-brand-bg border border-brand-border">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-4">
                📱
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Chaotic WhatsApp Groups</h3>
              <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                Academic questions get buried between informal chats, personal messages, and noisy group feeds with zero progress tracking.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-bg border border-brand-border">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-lg mb-4">
                🔄
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Repetitive Faculty Workload</h3>
              <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                Faculty members answer the exact same question dozens of times per semester because answers are never centrally indexed.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-brand-bg border border-brand-border">
              <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center font-bold text-lg mb-4">
                ⏳
              </div>
              <h3 className="text-lg font-bold text-brand-navy">Unpredictable Response Times</h3>
              <p className="text-sm text-brand-muted mt-2 leading-relaxed">
                Students approaching assignment deadlines have no guaranteed response SLA, causing unnecessary stress and missed submissions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-3 py-1 rounded-full border border-blue-200">
              The Solution
            </span>
            <h2 className="text-3xl font-bold text-brand-navy mt-4 tracking-tight">
              How BridgeX Creates Order
            </h2>
            <p className="mt-3 text-brand-muted text-base">
              A structured lifecycle that honors faculty time while delivering timely academic answers.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mt-14">
            <div className="bg-white p-6 rounded-2xl border border-brand-border relative">
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold mb-4">
                1
              </div>
              <h4 className="font-bold text-brand-navy text-base">Structured Submission</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Students submit doubts tagged with subject, topic, urgency, and optional PDF/image attachments.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-border relative">
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold mb-4">
                2
              </div>
              <h4 className="font-bold text-brand-navy text-base">Smart Duplicate Check</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                As the student types, similar resolved questions are instantly suggested to avoid duplicate submissions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-border relative">
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold mb-4">
                3
              </div>
              <h4 className="font-bold text-brand-navy text-base">Organized Queue</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Faculty manage questions in an organized dashboard, post answers, or schedule consultation slots.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-brand-border relative">
              <div className="w-8 h-8 rounded-full bg-brand-blue text-white flex items-center justify-center text-sm font-bold mb-4">
                4
              </div>
              <h4 className="font-bold text-brand-navy text-base">48h SLA Escalation</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                Doubts unresolved after 48 hours automatically flag administrators to guarantee institutional accountability.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-white border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-3 py-1 rounded-full border border-blue-200">
              Enterprise Grade
            </span>
            <h2 className="text-3xl font-bold text-brand-navy mt-4 tracking-tight">
              Engineered for Modern Universities
            </h2>
            <p className="mt-3 text-brand-muted text-base">
              Everything needed to support departments, students, and professors seamlessly.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-14">
            <div className="p-6 rounded-2xl border border-brand-border hover:shadow-md transition-shadow">
              <div className="p-3 w-fit rounded-xl bg-blue-50 text-brand-blue mb-4">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-brand-navy text-lg">Real-Time Duplicate Detection</h3>
              <p className="text-sm text-brand-muted mt-2">
                Lexical and topic matching finds similar questions during typing, saving faculty hundreds of repetitive answers.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-brand-border hover:shadow-md transition-shadow">
              <div className="p-3 w-fit rounded-xl bg-purple-50 text-purple-600 mb-4">
                <Calendar className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-brand-navy text-lg">Office-Hour Consultation Booking</h3>
              <p className="text-sm text-brand-muted mt-2">
                Faculty configure availability slots. Students book 20-minute 1-on-1 consultations with built-in conflict prevention.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-brand-border hover:shadow-md transition-shadow">
              <div className="p-3 w-fit rounded-xl bg-red-50 text-red-600 mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-brand-navy text-lg">Automated 48h Escalation</h3>
              <p className="text-sm text-brand-muted mt-2">
                System background service monitors queue age and automatically alerts department HODs when SLA limits are breached.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-brand-border hover:shadow-md transition-shadow">
              <div className="p-3 w-fit rounded-xl bg-emerald-50 text-emerald-600 mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-brand-navy text-lg">Solved Repository Knowledge Base</h3>
              <p className="text-sm text-brand-muted mt-2">
                Verified faculty answers can be published to a searchable institutional repository with student helpfulness ratings.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-brand-border hover:shadow-md transition-shadow">
              <div className="p-3 w-fit rounded-xl bg-amber-50 text-amber-600 mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-brand-navy text-lg">Class Representative Portal</h3>
              <p className="text-sm text-brand-muted mt-2">
                CRs can monitor section-wide queries, forward queries to appropriate faculty, and generate weekly academic summaries.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-brand-border hover:shadow-md transition-shadow">
              <div className="p-3 w-fit rounded-xl bg-teal-50 text-teal-600 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-brand-navy text-lg">Strict Role-Based Access</h3>
              <p className="text-sm text-brand-muted mt-2">
                Complete data separation between Student, Faculty, Class Representative, and Administrator personas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (Clearly labeled demo content) */}
      <section id="testimonials" className="py-20 bg-brand-bg border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-blue bg-blue-100 px-3 py-1 rounded-full">
              Demonstration Content
            </span>
            <h2 className="text-3xl font-bold text-brand-navy mt-4 tracking-tight">
              Sample Institutional Feedback
            </h2>
            <p className="mt-2 text-xs text-brand-muted italic">
              (Sample personas demonstrating system value proposition)
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="p-6 rounded-2xl bg-white border border-brand-border shadow-sm flex flex-col justify-between">
              <p className="text-sm text-brand-text italic leading-relaxed">
                "BridgeX eliminated our chaotic WhatsApp groups. My students now have transparent response timelines, and I can answer questions in one focused sitting."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-sm">
                  PR
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">Dr. Priya Raman (Sample)</div>
                  <div className="text-[11px] text-brand-muted">Associate Professor, Computer Science</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-brand-border shadow-sm flex flex-col justify-between">
              <p className="text-sm text-brand-text italic leading-relaxed">
                "When preparing for midterms, the Solved Repository let me browse previous questions from my exact professor. It saved me hours of waiting."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                  AS
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">Aarav Sharma (Sample)</div>
                  <div className="text-[11px] text-brand-muted">3rd Year B.Tech Student</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-brand-border shadow-sm flex flex-col justify-between">
              <p className="text-sm text-brand-text italic leading-relaxed">
                "As HOD, the 48-hour escalation queue gave me unprecedented visibility into department bottlenecks. Our response rate improved by over 40%."
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm">
                  KV
                </div>
                <div>
                  <div className="text-xs font-bold text-brand-navy">Dr. K. Venkat (Sample)</div>
                  <div className="text-[11px] text-brand-muted">HOD Computer Science & Eng.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white border-t border-brand-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-brand-navy tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-5 rounded-xl border border-brand-border bg-brand-bg">
              <h4 className="font-bold text-sm text-brand-navy">How does duplicate question detection work?</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                When submitting a doubt, BridgeX runs tokenization and academic term matching against existing questions in the same subject, suggesting potential answers instantly.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-brand-border bg-brand-bg">
              <h4 className="font-bold text-sm text-brand-navy">What happens when a doubt exceeds 48 hours?</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                The automated escalation engine marks the doubt as escalated, records an audit log entry, and notifies the Department Head and faculty for immediate resolution.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-brand-border bg-brand-bg">
              <h4 className="font-bold text-sm text-brand-navy">Can Class Representatives see private student queries?</h4>
              <p className="text-xs text-brand-muted mt-2 leading-relaxed">
                No. CRs only have access to aggregated statistics and can forward general doubts within their assigned section.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 bg-brand-navy text-white text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Bridge the Doubt Gap?
          </h2>
          <p className="mt-4 text-brand-muted text-base max-w-xl mx-auto">
            Experience structured academic communication with BridgeX today.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-6 py-3.5 rounded-xl bg-brand-blue text-white font-semibold hover:bg-blue-600 transition-colors shadow-lg"
            >
              Get Started Now
            </Link>
            <Link
              to="/login"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-brand-border py-8 text-center text-xs text-brand-muted">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <BrandLogo size="sm" />
          <p>© 2026 BridgeX Academic Systems. Connecting Students. Bridging Doubts. Empowering Faculty.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-brand-blue">Privacy</a>
            <a href="#" className="hover:text-brand-blue">Terms</a>
            <a href="#" className="hover:text-brand-blue">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
