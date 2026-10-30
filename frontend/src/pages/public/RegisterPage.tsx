import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/ui/BrandLogo';
import { api } from '../../services/api';
import { UserPlus, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'student' | 'faculty' | 'cr'>('student');
  const [rollOrEmp, setRollOrEmp] = useState('');
  const [section, setSection] = useState('A');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api.register({
        full_name: fullName,
        email,
        password,
        role,
        roll_number: role !== 'faculty' ? rollOrEmp : undefined,
        employee_id: role === 'faculty' ? rollOrEmp : undefined,
        section,
        department_id: 1, // Default CSE
      });
      localStorage.setItem('bridgex_token', data.access_token);
      await refreshUser();
      if (role === 'student') navigate('/student/dashboard');
      else if (role === 'faculty') navigate('/faculty/dashboard');
      else if (role === 'cr') navigate('/cr/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo size="lg" className="justify-center" />
        <h2 className="mt-4 text-2xl font-bold tracking-tight text-brand-navy">
          Create Your BridgeX Account
        </h2>
        <p className="mt-1 text-xs text-brand-muted">
          Join your university academic communication network
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

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Aarav Sharma"
                className="w-full px-3 py-2 text-sm rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Institutional Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@bridgex.edu"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Academic Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue bg-white"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                  <option value="cr">Class Rep (CR)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  {role === 'faculty' ? 'Employee ID' : 'Roll Number'}
                </label>
                <input
                  type="text"
                  required
                  value={rollOrEmp}
                  onChange={(e) => setRollOrEmp(e.target.value)}
                  placeholder={role === 'faculty' ? 'FAC-101' : 'CS-2023-042'}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            </div>

            {role !== 'faculty' && (
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Class Section
                </label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="A"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-brand-border focus:outline-none focus:ring-2 focus:ring-brand-blue"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-blue text-white text-sm font-semibold hover:bg-blue-600 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>{loading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-brand-muted">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-blue hover:underline">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
