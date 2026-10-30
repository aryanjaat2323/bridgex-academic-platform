import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { UserRole } from '../../types';
import { LogIn, Sparkles, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role: UserRole) => {
    setError(null);
    setLoading(true);
    try {
      await demoLogin(role);
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'faculty') navigate('/faculty/dashboard');
      else if (role === 'cr') navigate('/cr/dashboard');
      else if (role === 'admin') navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo size="lg" className="justify-center" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-brand-navy">
          Sign In to Your Academic Account
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Access your courses, doubt queue, and office hours
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm border border-brand-border sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@bridgex.edu"
                className="w-full px-3 py-2 text-sm rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 text-sm rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Instant Live Demo Role Logins */}
          <div className="mt-6 pt-6 border-t border-brand-border">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-navy mb-3">
              <Sparkles className="w-3.5 h-3.5 text-brand-blue" />
              <span>Instant Live Demo Access</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleDemo('student')}
                className="p-2.5 rounded-lg border border-brand-border hover:border-brand-blue hover:bg-blue-50/50 text-left transition-all"
              >
                <div className="font-bold text-brand-blue">🎓 Student</div>
                <div className="text-[11px] text-brand-muted">Aarav Sharma</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('faculty')}
                className="p-2.5 rounded-lg border border-brand-border hover:border-brand-blue hover:bg-purple-50/50 text-left transition-all"
              >
                <div className="font-bold text-purple-600">👩‍🏫 Faculty</div>
                <div className="text-[11px] text-brand-muted">Dr. Priya Raman</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('cr')}
                className="p-2.5 rounded-lg border border-brand-border hover:border-brand-blue hover:bg-emerald-50/50 text-left transition-all"
              >
                <div className="font-bold text-emerald-600">📋 Class Rep</div>
                <div className="text-[11px] text-brand-muted">Tanya Verma</div>
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="p-2.5 rounded-lg border border-brand-border hover:border-brand-blue hover:bg-red-50/50 text-left transition-all"
              >
                <div className="font-bold text-red-600">🏛️ Admin / HOD</div>
                <div className="text-[11px] text-brand-muted">Dr. K. Venkat</div>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-brand-muted">
            Don't have an institutional account?{' '}
            <Link to="/register" className="font-semibold text-brand-blue hover:underline">
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
