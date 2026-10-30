export type UserRole = 'student' | 'faculty' | 'cr' | 'admin';

export type DoubtUrgency = 'normal' | 'important' | 'deadline_approaching';

export type DoubtStatus = 'pending' | 'seen' | 'queued' | 'answered' | 'resolved';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  department_id?: number;
  department_name?: string;
  roll_number?: string;
  employee_id?: string;
  section?: string;
  office_room?: string;
  avatar_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
  hod_name?: string;
}

export interface Course {
  id: number;
  department_id: number;
  name: string;
  code: string;
}

export interface Subject {
  id: number;
  course_id: number;
  name: string;
  code: string;
  semester: number;
  course_name?: string;
  department_name?: string;
  assigned_faculty_name?: string;
  assigned_faculty_id?: number;
}

export interface DoubtResponse {
  id: number;
  doubt_id: number;
  author_id: number;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  content: string;
  attachment_url?: string;
  is_faculty_answer: boolean;
  created_at: string;
}

export interface TimelineAudit {
  id: number;
  previous_status: string;
  new_status: string;
  changed_by_name?: string;
  reason?: string;
  created_at: string;
}

export interface Doubt {
  id: number;
  reference_id: string;
  student_id: number;
  student_name: string;
  student_roll?: string;
  assigned_faculty_id?: number;
  faculty_name?: string;
  subject_id: number;
  subject_name: string;
  subject_code: string;
  topic: string;
  title: string;
  description: string;
  context_notes?: string;
  urgency: DoubtUrgency;
  status: DoubtStatus;
  is_escalated: boolean;
  escalated_at?: string;
  escalation_reason?: string;
  is_published: boolean;
  upvotes: number;
  attachment_url?: string;
  merged_into_id?: number;
  created_at: string;
  updated_at: string;
  response_count: number;
  average_rating?: number;
}

export interface DoubtDetail extends Doubt {
  responses: DoubtResponse[];
  timeline: TimelineAudit[];
}

export interface DuplicateMatch {
  id: number;
  reference_id: string;
  title: string;
  topic: string;
  status: string;
  similarity_score: number;
  has_answer: boolean;
  answer_preview?: string;
}

export interface OfficeHourSlot {
  id: number;
  faculty_id: number;
  faculty_name: string;
  day_of_week: string;
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  faculty_id: number;
  faculty_name: string;
  faculty_office?: string;
  student_id: number;
  student_name: string;
  student_roll?: string;
  appointment_date: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  cancellation_reason?: string;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  link_url?: string;
  is_read: boolean;
  created_at: string;
}
