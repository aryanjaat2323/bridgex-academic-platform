import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Building, Hash, MapPin, CheckCircle2 } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-navy">Profile & Account Settings</h1>
        <p className="text-xs text-brand-muted mt-1">
          Review your academic identity, assigned department, and role permissions.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-brand-border shadow-sm space-y-6">
        <div className="flex items-center gap-4 border-b border-brand-border pb-6">
          <img
            src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
            alt={user?.full_name}
            className="w-16 h-16 rounded-full border-2 border-brand-blue object-cover shadow-sm bg-white"
          />
          <div>
            <h2 className="text-lg font-bold text-brand-navy">{user?.full_name}</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-blue bg-brand-blue-light px-2.5 py-0.5 rounded-full">
                {user?.role}
              </span>
              <span className="text-xs text-brand-muted">
                {user?.department_name || 'Computer Science & Engineering'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-brand-bg border border-brand-border space-y-1">
            <div className="text-brand-muted flex items-center gap-1.5 font-medium">
              <Mail className="w-3.5 h-3.5" />
              <span>Email Address</span>
            </div>
            <div className="font-bold text-brand-navy text-sm">{user?.email}</div>
          </div>

          <div className="p-4 rounded-xl bg-brand-bg border border-brand-border space-y-1">
            <div className="text-brand-muted flex items-center gap-1.5 font-medium">
              <Building className="w-3.5 h-3.5" />
              <span>Academic Department</span>
            </div>
            <div className="font-bold text-brand-navy text-sm">
              {user?.department_name || 'Computer Science & Engineering'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-bg border border-brand-border space-y-1">
            <div className="text-brand-muted flex items-center gap-1.5 font-medium">
              <Hash className="w-3.5 h-3.5" />
              <span>{user?.role === 'faculty' ? 'Employee Code' : 'Student Roll Number'}</span>
            </div>
            <div className="font-bold text-brand-navy text-sm">
              {user?.roll_number || user?.employee_id || 'CS-2023-042'}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-brand-bg border border-brand-border space-y-1">
            <div className="text-brand-muted flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5" />
              <span>{user?.role === 'faculty' ? 'Faculty Office' : 'Section / Cohort'}</span>
            </div>
            <div className="font-bold text-brand-navy text-sm">
              {user?.office_room || `Section ${user?.section || 'A'}`}
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Account verified with institutional authentication and role-based permissions.</span>
        </div>
      </div>
    </div>
  );
};
