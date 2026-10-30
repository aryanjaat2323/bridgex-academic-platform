import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { BrandLogo } from '../ui/BrandLogo';
import { UserRole } from '../../types';
import {
  Bell,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Sparkles,
  BookOpen,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, role, logout, demoLogin } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const navigate = useNavigate();

  const handleSwitchRole = async (targetRole: UserRole) => {
    setShowRoleSwitcher(false);
    await demoLogin(targetRole);
    if (targetRole === 'student') navigate('/student/dashboard');
    else if (targetRole === 'faculty') navigate('/faculty/dashboard');
    else if (targetRole === 'cr') navigate('/cr/dashboard');
    else if (targetRole === 'admin') navigate('/admin/dashboard');
  };

  const getRoleBadge = (r: UserRole | null) => {
    switch (r) {
      case 'student':
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Student</span>;
      case 'faculty':
        return <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Faculty</span>;
      case 'cr':
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Class Rep (CR)</span>;
      case 'admin':
        return <span className="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-medium">Administrator</span>;
      default:
        return null;
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-brand-border h-16 flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <BrandLogo size="md" />
        <div className="hidden md:flex items-center gap-2">
          {getRoleBadge(role)}
          <span className="text-xs text-brand-muted">
            {user?.department_name || 'Academic Portal'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Fast Demo Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand-blue-light text-brand-blue hover:bg-blue-100 transition-colors border border-blue-200"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Switch Role Demo</span>
            <ChevronDown className="w-3 h-3" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-brand-border py-2 z-50">
              <div className="px-3 py-1 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Switch Live Persona
              </div>
              <button
                onClick={() => handleSwitchRole('student')}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-brand-bg transition-colors ${role === 'student' ? 'font-bold text-brand-blue' : 'text-brand-text'}`}
              >
                <span>Aarav (Student)</span>
                <span className="text-xs text-gray-500">B.Tech Sec A</span>
              </button>
              <button
                onClick={() => handleSwitchRole('faculty')}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-brand-bg transition-colors ${role === 'faculty' ? 'font-bold text-brand-blue' : 'text-brand-text'}`}
              >
                <span>Dr. Priya (Faculty)</span>
                <span className="text-xs text-gray-500">DSA / OS</span>
              </button>
              <button
                onClick={() => handleSwitchRole('cr')}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-brand-bg transition-colors ${role === 'cr' ? 'font-bold text-brand-blue' : 'text-brand-text'}`}
              >
                <span>Tanya (Class Rep)</span>
                <span className="text-xs text-gray-500">Sec A Rep</span>
              </button>
              <button
                onClick={() => handleSwitchRole('admin')}
                className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between hover:bg-brand-bg transition-colors ${role === 'admin' ? 'font-bold text-brand-blue' : 'text-brand-text'}`}
              >
                <span>Dr. Venkat (HOD Admin)</span>
                <span className="text-xs text-gray-500">HOD CSE</span>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-bg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-2xl border border-brand-border py-2 z-50">
              <div className="px-4 py-2 border-b border-brand-border flex items-center justify-between">
                <span className="font-semibold text-sm text-brand-text">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllAsRead()}
                    className="text-xs text-brand-blue hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-sm text-brand-muted">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.slice(0, 6).map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => {
                        markAsRead(notif.id);
                        if (notif.link_url) {
                          navigate(notif.link_url);
                          setShowNotifications(false);
                        }
                      }}
                      className={`p-3.5 cursor-pointer hover:bg-brand-bg transition-colors flex gap-3 text-left ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                    >
                      <div className="mt-0.5">
                        {notif.type === 'escalation' ? (
                          <AlertTriangle className="w-4 h-4 text-red-500" />
                        ) : notif.type === 'booking' ? (
                          <Calendar className="w-4 h-4 text-brand-blue" />
                        ) : (
                          <BookOpen className="w-4 h-4 text-emerald-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-semibold text-brand-text flex items-center justify-between">
                          <span>{notif.title}</span>
                          {!notif.is_read && <span className="w-2 h-2 rounded-full bg-brand-blue"></span>}
                        </div>
                        <p className="text-xs text-brand-muted mt-0.5 line-clamp-2">{notif.message}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2 border-t border-brand-border text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="text-xs text-brand-blue font-semibold hover:underline"
                >
                  View All Notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="flex items-center gap-2 pl-2 border-l border-brand-border">
          <img
            src={user?.avatar_url || 'https://api.dicebear.com/7.x/initials/svg?seed=BX'}
            alt={user?.full_name}
            className="w-8 h-8 rounded-full border border-brand-border object-cover bg-white"
          />
          <div className="hidden lg:flex flex-col text-left">
            <span className="text-xs font-semibold text-brand-text truncate max-w-[120px]">
              {user?.full_name}
            </span>
            <span className="text-[10px] text-brand-muted capitalize">
              {user?.role}
            </span>
          </div>
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-brand-muted hover:text-red-600 hover:bg-red-50 transition-colors ml-1"
            title="Log Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
