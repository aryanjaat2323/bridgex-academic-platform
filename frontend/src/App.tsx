import React, { Component, ErrorInfo, ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppLayout } from './components/layout/AppLayout';

// Public pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Student pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { SubmitDoubtPage } from './pages/student/SubmitDoubtPage';
import { MyDoubtsPage } from './pages/student/MyDoubtsPage';
import { OfficeHourBookingPage } from './pages/student/OfficeHourBookingPage';

// Faculty pages
import { FacultyDashboard } from './pages/faculty/FacultyDashboard';
import { FacultyQueuePage } from './pages/faculty/FacultyQueuePage';
import { FacultyOfficeHoursPage } from './pages/faculty/FacultyOfficeHoursPage';
import { FacultyAnalyticsPage } from './pages/faculty/FacultyAnalyticsPage';

// CR pages
import { CRDashboard } from './pages/cr/CRDashboard';
import { CRQueriesPage } from './pages/cr/CRQueriesPage';

// Admin pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminEscalationsPage } from './pages/admin/AdminEscalationsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminMappingsPage } from './pages/admin/AdminMappingsPage';

// Shared pages
import { DoubtDetailPage } from './pages/shared/DoubtDetailPage';
import { SolvedRepositoryPage } from './pages/shared/SolvedRepositoryPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { ProfilePage } from './pages/shared/ProfilePage';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('BridgeX Uncaught Exception:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-2xl border border-brand-border shadow-xl max-w-md w-full space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xl mx-auto">
              !
            </div>
            <h2 className="text-xl font-bold text-brand-navy">Something went wrong</h2>
            <p className="text-xs text-brand-muted">
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('bridgex_token');
                window.location.hash = '#/';
                window.location.reload();
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-blue text-white text-xs font-semibold hover:bg-blue-600 shadow-sm"
            >
              Reset Session & Go Home
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
          <span className="text-xs text-brand-muted">Loading BridgeX portal...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
          <span className="text-xs text-brand-muted">Connecting to academic network...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  switch (user.role) {
    case 'faculty':
      return <Navigate to="/faculty/dashboard" replace />;
    case 'cr':
      return <Navigate to="/cr/dashboard" replace />;
    case 'admin':
      return <Navigate to="/admin/dashboard" replace />;
    case 'student':
    default:
      return <Navigate to="/student/dashboard" replace />;
  }
};

export const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <HashRouter>
            <Routes>
              {/* Public */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/landing" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Authenticated Dashboard Shell */}
              <Route
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                {/* Student */}
                <Route path="/student/dashboard" element={<StudentDashboard />} />
                <Route path="/student/submit" element={<SubmitDoubtPage />} />
                <Route path="/student/doubts" element={<MyDoubtsPage />} />
                <Route path="/student/doubts/:id" element={<DoubtDetailPage />} />
                <Route path="/student/appointments" element={<OfficeHourBookingPage />} />

                {/* Faculty */}
                <Route path="/faculty/dashboard" element={<FacultyDashboard />} />
                <Route path="/faculty/queue" element={<FacultyQueuePage />} />
                <Route path="/faculty/appointments" element={<FacultyOfficeHoursPage />} />
                <Route path="/faculty/analytics" element={<FacultyAnalyticsPage />} />

                {/* CR */}
                <Route path="/cr/dashboard" element={<CRDashboard />} />
                <Route path="/cr/queries" element={<CRQueriesPage />} />

                {/* Admin */}
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/escalations" element={<AdminEscalationsPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/mappings" element={<AdminMappingsPage />} />

                {/* Shared */}
                <Route path="/repository" element={<SolvedRepositoryPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
