import axios from 'axios';
import {
  User, Department, Course, Subject, Doubt, DoubtDetail,
  DuplicateMatch, OfficeHourSlot, Appointment, NotificationItem
} from '../types';
import { DEMO_USERS, ROLE_TO_EMAIL } from './mockAuth';

// Resolve API base URL from environment variable (production) or dev proxy.
// Set VITE_API_URL in .env.local for production builds (e.g., https://your-backend.onrender.com).
// Leave VITE_API_URL empty for local development — the Vite proxy forwards /api → localhost:8000.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 6000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('bridgex_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const api = {
  login: async (email: string, password: string) => {
    try {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    } catch (err: any) {
      // If server responded with an error from backend (like 400 Bad Request with custom detail)
      if (err.response && err.response.data) {
        throw err;
      }
      // If backend is unreachable (e.g. static site preview or server offline)
      // Check if credentials match the verified institutional demo credentials
      const normalizedEmail = email.trim().toLowerCase();
      if (password === 'password123' && DEMO_USERS[normalizedEmail]) {
        const demoUser = DEMO_USERS[normalizedEmail];
        const mockToken = `demo_token_${demoUser.role}_${Date.now()}`;
        return {
          access_token: mockToken,
          token_type: 'bearer',
          user: demoUser,
        };
      }
      throw err;
    }
  },
  demoLogin: async (role: string) => {
    try {
      const res = await apiClient.post(`/auth/demo-login/${role}`);
      return res.data;
    } catch (err: any) {
      if (err.response && err.response.data) {
        throw err;
      }
      const targetRole = role.toLowerCase();
      const demoEmail = Object.keys(DEMO_USERS).find(
        (key) => DEMO_USERS[key].role === targetRole
      );
      if (demoEmail && DEMO_USERS[demoEmail]) {
        const demoUser = DEMO_USERS[demoEmail];
        const mockToken = `demo_token_${demoUser.role}_${Date.now()}`;
        return {
          access_token: mockToken,
          token_type: 'bearer',
          user: demoUser,
        };
      }
      throw err;
    }
  },
  register: async (userData: any) => {
    const res = await apiClient.post('/auth/register', userData);
    return res.data;
  },
  getMe: async (): Promise<User> => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch (err: any) {
      const token = localStorage.getItem('bridgex_token');
      if (token && token.startsWith('demo_token_')) {
        const role = token.split('_')[2];
        const demoEmail = Object.keys(DEMO_USERS).find(
          (key) => DEMO_USERS[key].role === role
        );
        if (demoEmail && DEMO_USERS[demoEmail]) {
          return DEMO_USERS[demoEmail];
        }
      }
      throw err;
    }
  },

  // Academic
  getDepartments: async (): Promise<Department[]> => {
    const res = await apiClient.get('/academic/departments');
    return res.data;
  },
  getCourses: async (departmentId?: number): Promise<Course[]> => {
    const res = await apiClient.get('/academic/courses', { params: { department_id: departmentId } });
    return res.data;
  },
  getSubjects: async (courseId?: number): Promise<Subject[]> => {
    const res = await apiClient.get('/academic/subjects', { params: { course_id: courseId } });
    return res.data;
  },
  getFacultyDirectory: async (departmentId?: number): Promise<User[]> => {
    const res = await apiClient.get('/academic/faculty', { params: { department_id: departmentId } });
    return res.data;
  },

  // Doubts
  createDoubt: async (doubtData: {
    subject_id: number;
    topic: string;
    title: string;
    description: string;
    urgency: string;
    context_notes?: string;
    attachment_url?: string;
  }): Promise<Doubt> => {
    const res = await apiClient.post('/doubts', doubtData);
    return res.data;
  },
  getDoubts: async (params?: {
    status?: string;
    urgency?: string;
    subject_id?: number;
    is_escalated?: boolean;
    search?: string;
    mine_only?: boolean;
  }): Promise<Doubt[]> => {
    const res = await apiClient.get('/doubts', { params });
    return res.data;
  },
  getDoubtDetail: async (id: number): Promise<DoubtDetail> => {
    const res = await apiClient.get(`/doubts/${id}`);
    return res.data;
  },
  updateDoubtStatus: async (id: number, status: string, reason?: string): Promise<Doubt> => {
    const res = await apiClient.patch(`/doubts/${id}/status`, { status, reason });
    return res.data;
  },
  addResponse: async (id: number, content: string, is_faculty_answer = false, publish_to_repo = false) => {
    const res = await apiClient.post(`/doubts/${id}/responses`, {
      content,
      is_faculty_answer,
      publish_to_repo,
    });
    return res.data;
  },
  forwardDoubt: async (doubtId: number, targetFacultyId: number, crNote?: string) => {
    const res = await apiClient.post('/doubts/forward', {
      doubt_id: doubtId,
      target_faculty_id: targetFacultyId,
      cr_note: crNote,
    });
    return res.data;
  },

  // Duplicates
  checkDuplicates: async (title: string, topic: string, subjectId: number): Promise<DuplicateMatch[]> => {
    const res = await apiClient.post('/duplicates/check', {
      title,
      topic,
      subject_id: subjectId,
    });
    return res.data;
  },
  mergeDoubts: async (primaryId: number, mergedId: number, notes?: string) => {
    const res = await apiClient.post('/duplicates/merge', {
      primary_doubt_id: primaryId,
      merged_doubt_id: mergedId,
      notes,
    });
    return res.data;
  },

  // Solved Repository
  getRepository: async (params?: {
    subject_id?: number;
    topic?: string;
    search?: string;
    sort_by?: string;
  }): Promise<Doubt[]> => {
    const res = await apiClient.get('/repository', { params });
    return res.data;
  },
  upvoteQuestion: async (id: number) => {
    const res = await apiClient.post(`/repository/${id}/upvote`);
    return res.data;
  },
  rateAnswer: async (id: number, rating: number, feedback?: string) => {
    const res = await apiClient.post(`/repository/${id}/rate`, { rating, feedback });
    return res.data;
  },

  // Office Hours
  getSlots: async (facultyId?: number): Promise<OfficeHourSlot[]> => {
    const res = await apiClient.get('/office-hours/slots', { params: { faculty_id: facultyId } });
    return res.data;
  },
  createSlot: async (data: { day_of_week: string; start_time: string; end_time: string; slot_duration_minutes: number }) => {
    const res = await apiClient.post('/office-hours/slots', data);
    return res.data;
  },
  bookAppointment: async (data: {
    slot_id?: number;
    faculty_id: number;
    appointment_date: string;
    start_time: string;
    end_time: string;
    notes?: string;
  }): Promise<Appointment> => {
    const res = await apiClient.post('/office-hours/book', data);
    return res.data;
  },
  getAppointments: async (): Promise<Appointment[]> => {
    const res = await apiClient.get('/office-hours/appointments');
    return res.data;
  },
  cancelAppointment: async (id: number, reason?: string): Promise<Appointment> => {
    const res = await apiClient.patch(`/office-hours/appointments/${id}/cancel`, null, { params: { reason } });
    return res.data;
  },

  // Notifications
  getNotifications: async (): Promise<NotificationItem[]> => {
    const res = await apiClient.get('/notifications');
    return Array.isArray(res.data) ? res.data : [];
  },
  markNotificationRead: async (id: number) => {
    const res = await apiClient.patch(`/notifications/${id}/read`);
    return res.data;
  },
  markAllNotificationsRead: async () => {
    const res = await apiClient.patch('/notifications/read-all');
    return res.data;
  },

  // Analytics
  getStudentAnalytics: async () => {
    const res = await apiClient.get('/analytics/student');
    return res.data;
  },
  getFacultyAnalytics: async () => {
    const res = await apiClient.get('/analytics/faculty');
    return res.data;
  },
  getCRAnalytics: async () => {
    const res = await apiClient.get('/analytics/cr');
    return res.data;
  },
  getAdminAnalytics: async () => {
    const res = await apiClient.get('/analytics/admin');
    return res.data;
  },

  // Admin
  getUsers: async (role?: string): Promise<User[]> => {
    const res = await apiClient.get('/admin/users', { params: { role } });
    return res.data;
  },
  updateUserRole: async (id: number, newRole: string) => {
    const res = await apiClient.patch(`/admin/users/${id}/role`, { new_role: newRole });
    return res.data;
  },
  triggerEscalationCheck: async (thresholdHours = 48) => {
    const res = await apiClient.post('/admin/escalations/check', null, { params: { threshold_hours: thresholdHours } });
    return res.data;
  },
  getEscalatedDoubts: async (): Promise<Doubt[]> => {
    const res = await apiClient.get('/admin/escalations');
    return res.data;
  },
  assignFacultySubject: async (facultyId: number, subjectId: number, section = 'A') => {
    const res = await apiClient.post('/admin/assignments', {
      faculty_id: facultyId,
      subject_id: subjectId,
      section,
    });
    return res.data;
  },
};
