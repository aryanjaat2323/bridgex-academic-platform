import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { User, UserRole } from '../../types';
import { Users, Shield, UserCheck } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers(roleFilter || undefined);
      setUsers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.updateUserRole(userId, newRole);
      await loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">User & Role Management</h1>
          <p className="text-xs text-brand-muted mt-1">
            Oversee user accounts, department associations, and assign operational roles.
          </p>
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-3.5 py-2 text-xs rounded-xl border border-brand-border focus:ring-2 focus:ring-brand-blue bg-white font-medium self-start sm:self-auto"
        >
          <option value="">All Roles</option>
          <option value="student">Students</option>
          <option value="faculty">Faculty</option>
          <option value="cr">Class Representatives (CR)</option>
          <option value="admin">Administrators</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue mx-auto"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-brand-text">
              <thead className="bg-brand-bg border-b border-brand-border text-brand-muted font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">ID / Roll</th>
                  <th className="py-3 px-4">Role Assignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-bg transition-colors">
                    <td className="py-3 px-4 flex items-center gap-2.5">
                      <img
                        src={u.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=U'}
                        alt={u.full_name}
                        className="w-7 h-7 rounded-full border border-brand-border bg-white"
                      />
                      <span className="font-semibold text-brand-navy">{u.full_name}</span>
                    </td>
                    <td className="py-3 px-4 text-brand-muted">{u.email}</td>
                    <td className="py-3 px-4">{u.department_name || 'CSE'}</td>
                    <td className="py-3 px-4 text-brand-muted font-mono">{u.roll_number || u.employee_id || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 text-xs rounded-lg border border-brand-border font-semibold capitalize bg-white"
                      >
                        <option value="student">Student</option>
                        <option value="faculty">Faculty</option>
                        <option value="cr">Class Rep (CR)</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
