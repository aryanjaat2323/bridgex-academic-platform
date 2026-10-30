import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Inbox,
  BookCheck,
  Calendar,
  BarChart3,
  Users,
  AlertTriangle,
  Layers,
  Settings,
  Bell,
  CheckCircle2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { role } = useAuth();

  const getLinks = () => {
    switch (role) {
      case 'student':
        return [
          { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { to: '/student/submit', label: 'Submit Doubt', icon: PlusCircle },
          { to: '/student/doubts', label: 'My Doubts', icon: Inbox },
          { to: '/repository', label: 'Solved Repository', icon: BookCheck },
          { to: '/student/appointments', label: 'Faculty Office Hours', icon: Calendar },
          { to: '/notifications', label: 'Notifications', icon: Bell },
          { to: '/profile', label: 'Profile & Settings', icon: Settings },
        ];
      case 'faculty':
        return [
          { to: '/faculty/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
          { to: '/faculty/queue', label: 'Pending Queue', icon: Inbox },
          { to: '/repository', label: 'Solved Repository', icon: BookCheck },
          { to: '/faculty/appointments', label: 'Office Hours & Slots', icon: Calendar },
          { to: '/faculty/analytics', label: 'Workload & Analytics', icon: BarChart3 },
          { to: '/notifications', label: 'Notifications', icon: Bell },
          { to: '/profile', label: 'Profile & Settings', icon: Settings },
        ];
      case 'cr':
        return [
          { to: '/cr/dashboard', label: 'CR Overview', icon: LayoutDashboard },
          { to: '/student/submit', label: 'Submit Doubt', icon: PlusCircle },
          { to: '/cr/queries', label: 'Class Doubts Queue', icon: Inbox },
          { to: '/repository', label: 'Solved Repository', icon: BookCheck },
          { to: '/student/appointments', label: 'Faculty Office Hours', icon: Calendar },
          { to: '/notifications', label: 'Notifications', icon: Bell },
          { to: '/profile', label: 'Profile & Settings', icon: Settings },
        ];
      case 'admin':
        return [
          { to: '/admin/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
          { to: '/admin/escalations', label: '48h Escalations SLA', icon: AlertTriangle },
          { to: '/admin/users', label: 'User Management', icon: Users },
          { to: '/admin/mappings', label: 'Academic & Courses', icon: Layers },
          { to: '/repository', label: 'Knowledge Base', icon: BookCheck },
          { to: '/notifications', label: 'Notifications', icon: Bell },
          { to: '/profile', label: 'Profile & Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-64 bg-white border-r border-brand-border flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-brand-muted">
          Navigation
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-blue text-white shadow-sm'
                    : 'text-brand-text hover:bg-brand-bg hover:text-brand-blue'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* System Status Footnote */}
      <div className="p-4 border-t border-brand-border">
        <div className="bg-brand-bg rounded-lg p-3 border border-brand-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>SLA Engine Active (48h)</span>
          </div>
          <p className="text-[11px] text-brand-muted mt-1">
            BridgeX Academic SLA monitor running in background.
          </p>
        </div>
      </div>
    </aside>
  );
};
