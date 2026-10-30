import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BrandLogo } from '../../components/ui/BrandLogo';
import {
  Sparkles,
  HelpCircle,
  Eye,
  ShieldCheck,
  Users,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  LayoutGrid,
  Table as TableIcon,
  ArrowRight,
  Printer,
  ChevronRight,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface IdeaItem {
  id: number;
  title: string;
  method: string;
  description: string;
  status: 'MATRIX' | 'RETAINED' | 'EXPLORING' | 'DROPPED' | 'OUT OF SCOPE';
  cluster: string;
  clusterName: string;
  bridgeXMapping: string;
}

const IDEAS_DATA: IdeaItem[] = [
  {
    id: 1,
    title: "Central Doubt Portal",
    method: "Brainstorming",
    description: "Unified interface for students to submit and track academic doubts in real-time.",
    status: "MATRIX",
    cluster: "Cluster 1",
    clusterName: "Predictability & Transparency",
    bridgeXMapping: "Student Dashboard & Submit Doubt Page"
  },
  {
    id: 2,
    title: "Track Open/Resolved Doubts",
    method: "Brainstorming",
    description: "Visual status tags (Pending, Seen, Answered, Resolved) to eliminate silence anxiety.",
    status: "MATRIX",
    cluster: "Cluster 1",
    clusterName: "Predictability & Transparency",
    bridgeXMapping: "Lifecycle Timeline (StatusBadge.tsx)"
  },
  {
    id: 3,
    title: "Faculty Routing Mechanism",
    method: "SCAMPER (Modify)",
    description: "Automatically route doubts based on course code, section, and faculty office hours.",
    status: "MATRIX",
    cluster: "Cluster 2",
    clusterName: "Inbound Triage & Workload Control",
    bridgeXMapping: "Smart Subject-to-Faculty Routing Engine"
  },
  {
    id: 4,
    title: "CR Forwarding Assistant",
    method: "SCAMPER (Adapt)",
    description: "Standardized tool for Class Representatives to forward queries without losing context.",
    status: "RETAINED",
    cluster: "Cluster 3",
    clusterName: "Peer & CR Mediation",
    bridgeXMapping: "CR Forward Doubt Modal & Endorsement Notes"
  },
  {
    id: 5,
    title: "Searchable Solved FAQ Repository",
    method: "Brainstorming",
    description: "Archive resolved public doubts into an indexed repository to minimize duplicate inquiries.",
    status: "MATRIX",
    cluster: "Cluster 2",
    clusterName: "Inbound Triage & Workload Control",
    bridgeXMapping: "Solved Repository Knowledge Base"
  },
  {
    id: 6,
    title: "Anonymous Query Option",
    method: "Brainstorming",
    description: "Allow students hesitant to ask direct questions to submit questions anonymously.",
    status: "EXPLORING",
    cluster: "Other",
    clusterName: "Psychological Safety",
    bridgeXMapping: "Anonymous toggle in Doubt Submission Form"
  },
  {
    id: 7,
    title: "WhatsApp/Chat Integration",
    method: "SCAMPER (Combine)",
    description: "Bridge notifications directly to student chat apps without manual message copying.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Channel Integration",
    bridgeXMapping: "Web Push & Notification Center"
  },
  {
    id: 8,
    title: "Automatic Availability Reminders",
    method: "Brainstorming",
    description: "Push notifications when faculty cabin hours open, reschedule, or change.",
    status: "RETAINED",
    cluster: "Cluster 1",
    clusterName: "Predictability & Transparency",
    bridgeXMapping: "Faculty Office Hour Slot Notifier"
  },
  {
    id: 9,
    title: "Estimated Response Time Tag",
    method: "Brainstorming",
    description: "Dynamic wait-time indicator based on faculty teaching load and current backlog.",
    status: "EXPLORING",
    cluster: "Cluster 1",
    clusterName: "Predictability & Transparency",
    bridgeXMapping: "SLA ETA Tag (e.g. 'Usually answers within 4h')"
  },
  {
    id: 10,
    title: "Question Upvoting System",
    method: "Brainstorming",
    description: "Allow batchmates to upvote similar queries so faculty can answer once for everyone.",
    status: "MATRIX",
    cluster: "Cluster 2",
    clusterName: "Inbound Triage & Workload Control",
    bridgeXMapping: "Doubt Upvoting & 'I have this question too'"
  },
  {
    id: 11,
    title: "Merge Similar Questions",
    method: "SCAMPER (Combine)",
    description: "Group identical student doubts into a single unified thread automatically.",
    status: "RETAINED",
    cluster: "Cluster 2",
    clusterName: "Inbound Triage & Workload Control",
    bridgeXMapping: "Faculty Duplicate Merge Action"
  },
  {
    id: 12,
    title: "Office-Hours Booking Slotting",
    method: "Brainstorming",
    description: "Pre-book 5-minute cabin or online consultation slots to stop random walk-ins.",
    status: "MATRIX",
    cluster: "Cluster 4",
    clusterName: "Scheduling & Slot Management",
    bridgeXMapping: "Faculty Cabin Appointment Booking Page"
  },
  {
    id: 13,
    title: "Subject-Wise Virtual Rooms",
    method: "Mind Mapping",
    description: "Separate channels per course to prevent general announcement and discussion clutter.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Channel Partitioning",
    bridgeXMapping: "Course & Section Filtering Architecture"
  },
  {
    id: 14,
    title: "Peer Mentor Matching",
    method: "Brainstorming",
    description: "Match students with peer mentors or senior TAs for first-line academic triage.",
    status: "RETAINED",
    cluster: "Cluster 3",
    clusterName: "Peer & CR Mediation",
    bridgeXMapping: "Peer Help & CR Assistant Framework"
  },
  {
    id: 15,
    title: "Urgent Assignment Tags",
    method: "Brainstorming",
    description: "Visual urgency flags (High/Medium/Low) for doubts with impending submission cutoffs.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Prioritization",
    bridgeXMapping: "UrgencyBadge.tsx & Deadline Priority Queue"
  },
  {
    id: 16,
    title: "Photo and PDF Upload",
    method: "Brainstorming",
    description: "Multi-format file upload support for code snippets, diagrams, and handwritten math.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Context Enrichment",
    bridgeXMapping: "Doubt Attachment Upload API"
  },
  {
    id: 17,
    title: "Voice Note Submissions",
    method: "SCAMPER (Substitute)",
    description: "Audio query option for quick clarifications when typing complex questions is hard.",
    status: "DROPPED",
    cluster: "Other",
    clusterName: "Multimodal Query",
    bridgeXMapping: "Deferred: Audio accessibility roadmap"
  },
  {
    id: 18,
    title: "Multilingual Query Support",
    method: "Brainstorming",
    description: "Translate queries or responses across preferred languages automatically.",
    status: "OUT OF SCOPE",
    cluster: "Other",
    clusterName: "Localization",
    bridgeXMapping: "Excluded from MVP scope (English primary)"
  },
  {
    id: 19,
    title: "Structured Question Templates",
    method: "SCAMPER (Simplify)",
    description: "Force students to fill in Course Code, Topic, Context, and What they tried.",
    status: "MATRIX",
    cluster: "Cluster 2",
    clusterName: "Inbound Triage & Workload Control",
    bridgeXMapping: "SubmitDoubtPage Multi-Field Validation Schema"
  },
  {
    id: 20,
    title: "Faculty Pending-Doubts Queue",
    method: "Brainstorming",
    description: "Clean single-screen queue for faculty to rapidly clear doubts during downtime.",
    status: "MATRIX",
    cluster: "Cluster 2",
    clusterName: "Inbound Triage & Workload Control",
    bridgeXMapping: "FacultyQueuePage.tsx Single-Screen Triage"
  },
  {
    id: 21,
    title: "CR Summary Dashboard",
    method: "Mind Mapping",
    description: "Digest view for Class Representatives to track class-wide pending and resolved queries.",
    status: "RETAINED",
    cluster: "Cluster 3",
    clusterName: "Peer & CR Mediation",
    bridgeXMapping: "CRDashboard.tsx Section Analytics"
  },
  {
    id: 22,
    title: "After-Class Direct Capture",
    method: "Brainstorming",
    description: "Quick button or QR code to log a doubt right after class while faculty lecture is fresh.",
    status: "RETAINED",
    cluster: "Cluster 4",
    clusterName: "Scheduling & Slot Management",
    bridgeXMapping: "Quick Submit & Post-Lecture Tags"
  },
  {
    id: 23,
    title: "Weekly Anonymous Pulse",
    method: "Brainstorming",
    description: "Checkpoint pulse for student stress levels and recurring confusion near deadlines.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Student Wellbeing",
    bridgeXMapping: "CR Trends & Department Analytics"
  },
  {
    id: 24,
    title: "Classroom QR Submissions",
    method: "SCAMPER (Adapt)",
    description: "Scan a lecture slide QR code to log a doubt instantly directly into teacher's queue.",
    status: "RETAINED",
    cluster: "Cluster 4",
    clusterName: "Scheduling & Slot Management",
    bridgeXMapping: "QR Code Entry Endpoint"
  },
  {
    id: 25,
    title: "Dynamic Weekly Course FAQs",
    method: "Brainstorming",
    description: "Auto-generated summary of top answered questions each week pinned to students.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Knowledge Aggregation",
    bridgeXMapping: "Verified FAQ Highlights"
  },
  {
    id: 26,
    title: "Instant Reply Notifications",
    method: "Brainstorming",
    description: "Ping student immediately via web alert when faculty marks a doubt as resolved.",
    status: "RETAINED",
    cluster: "Cluster 1",
    clusterName: "Predictability & Transparency",
    bridgeXMapping: "NotificationContext.tsx Real-time Alerts"
  },
  {
    id: 27,
    title: "Helpful Answer Rating",
    method: "Brainstorming",
    description: "Students rate resolution clarity (1-5 stars) to improve future answer verification.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Quality Assurance",
    bridgeXMapping: "Helpful Answer Feedback Component"
  },
  {
    id: 28,
    title: "Escalation for Stuck Doubts",
    method: "SCAMPER (Reverse)",
    description: "Escalate queries stuck >48 hours near deadlines directly to HOD / Mentor view.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Accountability",
    bridgeXMapping: "AdminEscalationsPage & 48h SLA Engine"
  },
  {
    id: 29,
    title: "Response-Time Analytics",
    method: "Brainstorming",
    description: "Faculty dashboard metrics showing average turnaround time and resolution rates.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Faculty Insights",
    bridgeXMapping: "FacultyAnalyticsPage.tsx Recharts Engine"
  },
  {
    id: 30,
    title: "Course Resource Hub Links",
    method: "Brainstorming",
    description: "Attach reference course handouts, slides, and docs directly to answered FAQ threads.",
    status: "RETAINED",
    cluster: "Other",
    clusterName: "Resource Linking",
    bridgeXMapping: "Solved Thread References & Document Links"
  },
  {
    id: 31,
    title: "Smart Triage & Duplicate Blocker",
    method: "SCAMPER (Eliminate)",
    description: "Prevent students from posting identical questions if an active thread already exists.",
    status: "MATRIX",
    cluster: "Cluster 2",
    clusterName: "Inbound Triage & Workload Control",
    bridgeXMapping: "Real-time Lexical Matching Duplicate Detector"
  }
];

export const IdeationSelectionPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedMethod, setSelectedMethod] = useState<string>('ALL');
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  const filteredIdeas = useMemo(() => {
    return IDEAS_DATA.filter(idea => {
      const matchSearch =
        !search ||
        idea.id.toString() === search.trim() ||
        idea.title.toLowerCase().includes(search.toLowerCase()) ||
        idea.description.toLowerCase().includes(search.toLowerCase()) ||
        idea.bridgeXMapping.toLowerCase().includes(search.toLowerCase());

      const matchStatus = selectedStatus === 'ALL' || idea.status === selectedStatus;
      const matchMethod = selectedMethod === 'ALL' || idea.method.includes(selectedMethod);
      const matchCluster = selectedCluster === 'ALL' || idea.cluster === selectedCluster;

      return matchSearch && matchStatus && matchMethod && matchCluster;
    });
  }, [search, selectedStatus, selectedMethod, selectedCluster]);

  const handleClusterClick = (cluster: string) => {
    setSelectedCluster(cluster);
    setSelectedStatus('ALL');
    setSelectedMethod('ALL');
    setSearch('');
    const el = document.getElementById('ideas-catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedStatus('ALL');
    setSelectedMethod('ALL');
    setSelectedCluster('ALL');
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-brand-blue selection:text-white pb-16">
      {/* Top Header */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <BrandLogo size="md" />
            <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-brand-border">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-brand-blue">
                Stage 3: Ideate
              </span>
              <span className="text-xs font-mono font-medium text-brand-muted">
                INT335 • Project P09
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-brand-border hover:bg-gray-50 text-brand-text transition"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-brand-blue hover:bg-blue-600 text-white shadow-sm transition"
            >
              <span>BridgeX Home</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-10 flex-1">
        
        {/* Academic Header Banner */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-brand-border shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>INT335 Design Thinking • Checkpoint 4</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-brand-navy tracking-tight leading-tight">
                Heard in Class, <span className="text-brand-blue">Lost After</span>
              </h1>
              <p className="text-brand-muted text-base sm:text-lg leading-relaxed">
                Stage 3 Ideation artifact resolving the fragmented academic doubt lifecycle between students and faculty before critical course deadlines.
              </p>

              {/* Team Metadata Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-brand-bg p-3 rounded-xl border border-brand-border">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Course & Uni</span>
                  <span className="text-xs font-bold text-brand-navy">INT335 • LPU</span>
                </div>
                <div className="bg-brand-bg p-3 rounded-xl border border-brand-border">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Team Lead</span>
                  <span className="text-xs font-bold text-brand-navy">Unnati Gupta</span>
                </div>
                <div className="bg-brand-bg p-3 rounded-xl border border-brand-border">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Team Members</span>
                  <span className="text-xs font-medium text-brand-text truncate block" title="Kunwar Bhardwaj, Aryan, Guru Prasad Yadav">
                    Kunwar, Aryan, Guru Prasad
                  </span>
                </div>
                <div className="bg-brand-bg p-3 rounded-xl border border-brand-border">
                  <span className="text-[10px] font-bold text-brand-muted uppercase tracking-wider block">Target Users</span>
                  <span className="text-xs font-semibold text-brand-navy">Students, Faculty, CRs, HOD</span>
                </div>
              </div>
            </div>

            {/* 4 Stats Cards */}
            <div className="grid grid-cols-2 gap-3 min-w-[270px]">
              <div className="bg-brand-bg p-4 rounded-2xl border border-brand-border text-center">
                <span className="text-3xl font-extrabold text-brand-blue block font-mono">31</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Total Ideas Logged</span>
              </div>
              <div className="bg-brand-bg p-4 rounded-2xl border border-brand-border text-center">
                <span className="text-3xl font-extrabold text-emerald-600 block font-mono">3</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Methods Used</span>
              </div>
              <div className="bg-brand-bg p-4 rounded-2xl border border-brand-border text-center">
                <span className="text-3xl font-extrabold text-purple-600 block font-mono">4</span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-muted">Idea Clusters</span>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-4 rounded-2xl text-center shadow-md">
                <span className="text-3xl font-extrabold block font-mono flex items-center justify-center gap-1">
                  8.65 <span className="text-amber-200 text-xl">★</span>
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-100">Top Score (Idea C)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 1. MAIN HOW MIGHT WE (HMW) QUESTION */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm">
              1
            </div>
            <h2 className="text-2xl font-bold text-brand-navy tracking-tight">Main How Might We (HMW) Question</h2>
          </div>

          <div className="rounded-2xl border-l-4 border-l-orange-500 border border-brand-border bg-gradient-to-r from-orange-50/50 via-white to-white p-6 sm:p-8 space-y-4 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div className="space-y-3 flex-1">
                <blockquote className="text-xl sm:text-2xl font-medium text-brand-navy italic leading-snug">
                  &ldquo;How might we make it predictable, in the weeks before a submission, how and when a student&rsquo;s question will reach and be answered by the right faculty member, <span className="text-orange-600 font-semibold underline decoration-orange-300 underline-offset-4">without adding to faculty&rsquo;s unstructured inbound?</span>&rdquo;
                </blockquote>
                <div className="flex flex-wrap items-center gap-3 text-xs text-brand-muted pt-2 border-t border-brand-border">
                  <span className="inline-flex items-center gap-1 font-semibold text-brand-navy">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Key Friction Solved:
                  </span>
                  <span>Eliminates silence anxiety for students</span>
                  <span>&bull;</span>
                  <span>Shields faculty personal channels (WhatsApp/Email) from duplicate floods</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. IDEA GROUPING & THEMATIC CLUSTERS */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                2
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand-navy tracking-tight">Idea Grouping & Thematic Clusters</h2>
                <p className="text-xs text-brand-muted">Categorized to cover student certainty, faculty workload, peer support, and scheduling</p>
              </div>
            </div>
            <span className="text-xs text-brand-muted font-medium">Click any cluster to filter the 31 ideas below</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cluster 1 */}
            <div
              onClick={() => handleClusterClick('Cluster 1')}
              className="cursor-pointer group hover:border-brand-blue transition-all rounded-2xl p-5 border border-brand-border bg-white shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-brand-blue flex items-center justify-center font-bold">
                    <Eye className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-navy group-hover:text-brand-blue transition">
                      Cluster 1: Predictability & Transparency
                    </h3>
                    <span className="text-xs text-brand-blue font-semibold">Eliminates student silence anxiety (S4, S6)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-blue-50 text-brand-blue">5 Ideas</span>
              </div>
              <p className="text-xs text-brand-text leading-relaxed">
                <strong className="text-brand-navy">Focus:</strong> Visibility on response status, dynamic wait-time indicators, and real-time faculty cabin availability alerts.
              </p>
              <div className="pt-2 border-t border-brand-border flex flex-wrap gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#1 Central Portal</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#2 Status Tags</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#8 Cabin Alerts</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#9 Response Tag</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#26 Instant Ping</span>
              </div>
            </div>

            {/* Cluster 2 */}
            <div
              onClick={() => handleClusterClick('Cluster 2')}
              className="cursor-pointer group hover:border-emerald-500 transition-all rounded-2xl p-5 border border-brand-border bg-white shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-navy group-hover:text-emerald-600 transition">
                      Cluster 2: Inbound Triage & Workload Control
                    </h3>
                    <span className="text-xs text-emerald-600 font-semibold">Protects faculty from clutter (F1, F2)</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700">7 Ideas</span>
              </div>
              <p className="text-xs text-brand-text leading-relaxed">
                <strong className="text-brand-navy">Focus:</strong> Batching queries, real-time duplicate blocking, structured question schemas, and single-screen queue management.
              </p>
              <div className="pt-2 border-t border-brand-border flex flex-wrap gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#3 Auto-Routing</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#5 Solved FAQ</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#10 Upvoting</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#11 Merge Similar</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#19 Templates</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#20 Faculty Queue</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#31 Dup Blocker</span>
              </div>
            </div>

            {/* Cluster 3 */}
            <div
              onClick={() => handleClusterClick('Cluster 3')}
              className="cursor-pointer group hover:border-purple-500 transition-all rounded-2xl p-5 border border-brand-border bg-white shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-navy group-hover:text-purple-600 transition">
                      Cluster 3: Peer & CR Mediation
                    </h3>
                    <span className="text-xs text-purple-600 font-semibold">Relieves CR relay overload while preserving peer help</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-purple-50 text-purple-700">3 Ideas</span>
              </div>
              <p className="text-xs text-brand-text leading-relaxed">
                <strong className="text-brand-navy">Focus:</strong> First-line query filtering, endorsement workflows, peer mentors, and consolidated section-level digest views.
              </p>
              <div className="pt-2 border-t border-brand-border flex flex-wrap gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#4 CR Forwarding</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#14 Peer Mentors</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#21 CR Dashboard</span>
              </div>
            </div>

            {/* Cluster 4 */}
            <div
              onClick={() => handleClusterClick('Cluster 4')}
              className="cursor-pointer group hover:border-amber-500 transition-all rounded-2xl p-5 border border-brand-border bg-white shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-brand-navy group-hover:text-amber-600 transition">
                      Cluster 4: Scheduling & Slot Management
                    </h3>
                    <span className="text-xs text-amber-600 font-semibold">Replaces chaotic walk-in traffic with organized slots</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-amber-50 text-amber-700">3 Ideas</span>
              </div>
              <p className="text-xs text-brand-text leading-relaxed">
                <strong className="text-brand-navy">Focus:</strong> Structured time-slot allocation for physical cabin or virtual visits, post-class capture, and lecture QR codes.
              </p>
              <div className="pt-2 border-t border-brand-border flex flex-wrap gap-1.5">
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#12 Office-Hours Slotting</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#22 Post-Class Capture</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-brand-bg text-brand-text">#24 Lecture QR</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4 & 5. SCREENING CRITERIA & PUGH SCREENING MATRIX */}
        <section id="matrix" className="space-y-6 pt-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-brand-blue flex items-center justify-center font-bold text-sm">
              3
            </div>
            <div>
              <h2 className="text-2xl font-bold text-brand-navy tracking-tight">Concept Screening Matrix (Pugh Matrix)</h2>
              <p className="text-xs text-brand-muted">Pre-locked weighted evaluation comparing 5 candidate concepts across 5 critical dimensions</p>
            </div>
          </div>

          {/* Criteria Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-blue-900">C1: Student Predictability</span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-blue-200 text-blue-900">25%</span>
              </div>
              <p className="text-[11px] text-brand-muted">Clear visibility on whether and when a question will be answered.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-indigo-900">C2: Faculty Protection</span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-200 text-indigo-900">25%</span>
              </div>
              <p className="text-[11px] text-brand-muted">Prevents unstructured notification overload and repeat explanations.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-purple-900">C3: Peak-Load Scalability</span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-purple-200 text-purple-900">20%</span>
              </div>
              <p className="text-[11px] text-brand-muted">Performs effectively during submission deadline spikes.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-900">C4: Feasibility & Prototyping</span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-amber-200 text-amber-900">15%</span>
              </div>
              <p className="text-[11px] text-brand-muted">Can be prototyped rapidly with Figma / Web technologies.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-900">C5: Preserves Workflows</span>
                <span className="text-xs font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-200 text-emerald-900">15%</span>
              </div>
              <p className="text-[11px] text-brand-muted">Respects post-class discussions and existing CR channels.</p>
            </div>
          </div>

          {/* Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white shadow-sm">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-brand-bg border-b border-brand-border text-xs text-brand-muted font-bold uppercase tracking-wider">
                  <th className="p-4">Solution Concept</th>
                  <th className="p-4 text-center">C1 (25%)</th>
                  <th className="p-4 text-center">C2 (25%)</th>
                  <th className="p-4 text-center">C3 (20%)</th>
                  <th className="p-4 text-center">C4 (15%)</th>
                  <th className="p-4 text-center">C5 (15%)</th>
                  <th className="p-4 text-right font-black">Total Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border font-medium">
                {/* Concept A */}
                <tr className="hover:bg-brand-bg/50 transition">
                  <td className="p-4 font-semibold text-brand-navy">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold font-mono">A</span>
                      <span>AI Chatbot Auto-Answer Bot</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono">6</td>
                  <td className="p-4 text-center font-mono">7</td>
                  <td className="p-4 text-center font-mono">8</td>
                  <td className="p-4 text-center font-mono">5</td>
                  <td className="p-4 text-center font-mono">4</td>
                  <td className="p-4 text-right font-mono font-bold text-brand-navy">6.15</td>
                </tr>

                {/* Concept B */}
                <tr className="hover:bg-brand-bg/50 transition">
                  <td className="p-4 font-semibold text-brand-navy">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold font-mono">B</span>
                      <span>Cabin-Hour Booking App Only</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono">8</td>
                  <td className="p-4 text-center font-mono">5</td>
                  <td className="p-4 text-center font-mono">4</td>
                  <td className="p-4 text-center font-mono">7</td>
                  <td className="p-4 text-center font-mono">6</td>
                  <td className="p-4 text-right font-mono font-bold text-brand-navy">6.15</td>
                </tr>

                {/* Concept C (Winner) */}
                <tr className="bg-blue-50/80 border-y-2 border-brand-blue font-semibold">
                  <td className="p-4 text-brand-navy">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-brand-blue text-white flex items-center justify-center text-xs font-bold font-mono shadow-sm">C</span>
                      <div>
                        <span className="font-extrabold text-blue-900">Structured Doubt Triage & Scheduling Portal</span>
                        <span className="ml-2 inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          ★ SELECTED WINNER
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono text-brand-blue font-bold bg-blue-100/50">9</td>
                  <td className="p-4 text-center font-mono text-brand-blue font-bold bg-blue-100/50">9</td>
                  <td className="p-4 text-center font-mono text-brand-blue font-bold bg-blue-100/50">8</td>
                  <td className="p-4 text-center font-mono text-brand-blue font-bold bg-blue-100/50">8</td>
                  <td className="p-4 text-center font-mono text-brand-blue font-bold bg-blue-100/50">9</td>
                  <td className="p-4 text-right font-mono font-black text-xl text-brand-blue">8.65 ★</td>
                </tr>

                {/* Concept D */}
                <tr className="hover:bg-brand-bg/50 transition">
                  <td className="p-4 font-semibold text-brand-navy">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold font-mono">D</span>
                      <span>Enhanced CR Group Relay System</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono">4</td>
                  <td className="p-4 text-center font-mono">3</td>
                  <td className="p-4 text-center font-mono">3</td>
                  <td className="p-4 text-center font-mono">9</td>
                  <td className="p-4 text-center font-mono">7</td>
                  <td className="p-4 text-right font-mono font-bold text-brand-navy">5.05</td>
                </tr>

                {/* Concept E */}
                <tr className="hover:bg-brand-bg/50 transition">
                  <td className="p-4 font-semibold text-brand-navy">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-xs font-bold font-mono">E</span>
                      <span>Open Campus Public Forum Board</span>
                    </div>
                  </td>
                  <td className="p-4 text-center font-mono">7</td>
                  <td className="p-4 text-center font-mono">4</td>
                  <td className="p-4 text-center font-mono">5</td>
                  <td className="p-4 text-center font-mono">8</td>
                  <td className="p-4 text-center font-mono">5</td>
                  <td className="p-4 text-right font-mono font-bold text-brand-navy">5.90</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 6. CHOSEN CONCEPT & STRATEGIC RATIONALE */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
              4
            </div>
            <div>
              <h2 className="text-2xl font-bold text-brand-navy tracking-tight">Chosen Concept & Strategic Rationale</h2>
              <p className="text-xs text-brand-muted">Architectural justification for selecting Concept C and proceeding into implementation</p>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-border bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-brand-border">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-blue">Selected Solution</span>
                <h3 className="text-xl sm:text-2xl font-extrabold text-brand-navy">Structured Doubt Triage & Scheduling Portal (Idea C)</h3>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                Validated & Built as BridgeX
              </div>
            </div>

            <div className="space-y-4 text-brand-text text-sm sm:text-base leading-relaxed">
              <p className="font-medium text-brand-navy text-base">
                <strong>Core Rationale:</strong> Idea C scored highest (<span className="font-mono font-bold text-brand-blue">8.65 / 10</span>) because it addresses both sides of the university communication problem simultaneously.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/40 space-y-2">
                  <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-brand-blue" />
                    Guaranteed Student Predictability
                  </h4>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    Unlike pure open forums, Idea C provides students with clear status tracking (Pending → Seen → Queued → Resolved) and 48-hour SLA escalation. Silence anxiety is eliminated during crunch weeks.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/40 space-y-2">
                  <h4 className="font-bold text-sm text-emerald-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Strict Faculty Protection
                  </h4>
                  <p className="text-xs text-brand-muted leading-relaxed">
                    Faculty get a batched, structured queue with automatic duplicate detection and verified FAQ publishing. Working hours and office visit slots are preserved without random walk-ins.
                  </p>
                </div>
              </div>

              {/* Alternatives Teardown */}
              <div className="pt-4 border-t border-brand-border">
                <h4 className="font-bold text-xs text-brand-navy uppercase tracking-wider mb-3">Why Alternatives Failed:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl border border-brand-border bg-brand-bg">
                    <span className="font-bold text-brand-navy block mb-1">Idea A: AI Chatbot (6.15)</span>
                    <p className="text-brand-muted">High hallucination risk in graded academic coursework; destroys student trust.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-brand-border bg-brand-bg">
                    <span className="font-bold text-brand-navy block mb-1">Idea B: Booking App (6.15)</span>
                    <p className="text-brand-muted">Cannot scale when 150 students have queries the night before submission.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-brand-border bg-brand-bg">
                    <span className="font-bold text-brand-navy block mb-1">Idea D: CR Relay (5.05)</span>
                    <p className="text-brand-muted">Severe burnout for Class Representatives acting as human email routers.</p>
                  </div>
                  <div className="p-3 rounded-xl border border-brand-border bg-brand-bg">
                    <span className="font-bold text-brand-navy block mb-1">Idea E: Forum Board (5.90)</span>
                    <p className="text-brand-muted">Becomes an unorganized duplicate dump with zero faculty response accountability.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. FULL IDEATION LOG (31 IDEAS) */}
        <section id="ideas-catalog" className="space-y-6 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">
                5
              </div>
              <div>
                <h2 className="text-2xl font-bold text-brand-navy tracking-tight">Full Ideation Log (31 Ideas)</h2>
                <p className="text-xs text-brand-muted">Complete dataset of all brainstormed, adapted, and screened concepts</p>
              </div>
            </div>

            {/* View switcher */}
            <div className="flex items-center gap-1 bg-brand-bg p-1 rounded-xl border border-brand-border self-start sm:self-auto">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'cards'
                    ? 'bg-white shadow-sm text-brand-navy font-bold'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Cards View</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                  viewMode === 'table'
                    ? 'bg-white shadow-sm text-brand-navy font-bold'
                    : 'text-brand-muted hover:text-brand-text'
                }`}
              >
                <TableIcon className="w-3.5 h-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>

          {/* Search & Filters Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-brand-border shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-brand-muted absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search by title, description, or keyword..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl text-xs sm:text-sm border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="ALL">All Statuses (31)</option>
                <option value="MATRIX">MATRIX (Screened in Pugh)</option>
                <option value="RETAINED">RETAINED (In Roadmap)</option>
                <option value="EXPLORING">EXPLORING (R&D)</option>
                <option value="DROPPED">DROPPED</option>
                <option value="OUT OF SCOPE">OUT OF SCOPE</option>
              </select>

              {/* Method Filter */}
              <select
                value={selectedMethod}
                onChange={(e) => setSelectedMethod(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="ALL">All Methods</option>
                <option value="Brainstorming">Brainstorming (18)</option>
                <option value="SCAMPER">SCAMPER (11)</option>
                <option value="Mind Mapping">Mind Mapping (2)</option>
              </select>

              {/* Cluster Filter */}
              <select
                value={selectedCluster}
                onChange={(e) => setSelectedCluster(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-brand-border bg-brand-bg focus:outline-none focus:ring-2 focus:ring-brand-blue"
              >
                <option value="ALL">All Clusters</option>
                <option value="Cluster 1">Cluster 1: Predictability</option>
                <option value="Cluster 2">Cluster 2: Inbound Triage</option>
                <option value="Cluster 3">Cluster 3: Peer & CR</option>
                <option value="Cluster 4">Cluster 4: Scheduling</option>
              </select>
            </div>

            <div className="flex items-center justify-between text-xs text-brand-muted pt-1 border-t border-brand-border/60">
              <span>Showing <strong>{filteredIdeas.length}</strong> of 31 logged ideas</span>
              <button
                onClick={clearFilters}
                className="text-brand-blue hover:underline font-medium"
              >
                Reset filters
              </button>
            </div>
          </div>

          {/* Cards View */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredIdeas.map((idea) => {
                const isWinner = idea.status === 'MATRIX' && [1, 2, 3, 5, 10, 12, 19, 20, 31].includes(idea.id);
                return (
                  <div
                    key={idea.id}
                    className="rounded-2xl p-5 border border-brand-border bg-white shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-7 h-7 rounded-lg bg-brand-bg font-mono font-bold text-xs text-brand-navy flex items-center justify-center">
                            #{idea.id}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              idea.status === 'MATRIX'
                                ? 'bg-blue-100 text-brand-blue'
                                : idea.status === 'RETAINED'
                                ? 'bg-emerald-100 text-emerald-700'
                                : idea.status === 'EXPLORING'
                                ? 'bg-amber-100 text-amber-700'
                                : idea.status === 'DROPPED'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {idea.status}
                          </span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-bg text-brand-muted border border-brand-border">
                          {idea.method}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-brand-navy group-hover:text-brand-blue transition leading-snug">
                        {idea.title}
                      </h3>

                      <p className="text-xs text-brand-muted leading-relaxed">
                        {idea.description}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-brand-border space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-brand-muted">Cluster:</span>
                        <span className="font-semibold text-brand-navy truncate max-w-[170px]" title={idea.clusterName}>
                          {idea.cluster !== 'Other' ? idea.cluster + ': ' : ''}{idea.clusterName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-brand-muted">In BridgeX:</span>
                        <span className="font-semibold text-brand-blue truncate max-w-[170px]" title={idea.bridgeXMapping}>
                          {idea.bridgeXMapping}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="overflow-x-auto rounded-2xl border border-brand-border bg-white shadow-sm">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-bg border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider">
                    <th className="p-3 w-12 text-center">#</th>
                    <th className="p-3">Idea Title</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Core Mechanism / Description</th>
                    <th className="p-3">Cluster</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border">
                  {filteredIdeas.map((idea) => (
                    <tr key={idea.id} className="hover:bg-brand-bg/50 transition">
                      <td className="p-3 text-center font-mono font-bold text-brand-muted">#{idea.id}</td>
                      <td className="p-3 font-bold text-brand-navy">{idea.title}</td>
                      <td className="p-3 whitespace-nowrap text-brand-muted">{idea.method}</td>
                      <td className="p-3 text-brand-text max-w-sm">{idea.description}</td>
                      <td className="p-3 text-brand-navy whitespace-nowrap">{idea.cluster}</td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            idea.status === 'MATRIX'
                              ? 'bg-blue-100 text-brand-blue'
                              : idea.status === 'RETAINED'
                              ? 'bg-emerald-100 text-emerald-700'
                              : idea.status === 'EXPLORING'
                              ? 'bg-amber-100 text-amber-700'
                              : idea.status === 'DROPPED'
                              ? 'bg-red-100 text-red-600'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {idea.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Call to action & Platform Link */}
        <section className="rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 sm:p-10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-xs font-bold text-brand-blue uppercase tracking-wider block">Completed Academic Pipeline</span>
            <h3 className="text-2xl font-bold text-brand-navy">Explore BridgeX in Interactive Demo Mode</h3>
            <p className="text-xs sm:text-sm text-brand-muted leading-relaxed">
              Log in with one click as Student, Faculty, CR, or Admin to witness the validated Concept C workflows running live.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-brand-blue hover:bg-blue-600 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition flex items-center gap-2"
            >
              <span>Launch Live Portals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-brand-border bg-white py-6 text-xs text-brand-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="font-semibold text-brand-navy">INT335 Design Thinking • Project P09</span>
            <span className="mx-2">&bull;</span>
            <span>Lovely Professional University</span>
          </div>
          <div>
            Team BridgeX: Unnati Gupta, Kunwar Bhardwaj, Aryan, Guru Prasad Yadav
          </div>
        </div>
      </footer>
    </div>
  );
};
