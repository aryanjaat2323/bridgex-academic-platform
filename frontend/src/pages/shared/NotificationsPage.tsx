import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/NotificationContext';
import { Bell, CheckCheck, AlertTriangle, Calendar, BookOpen } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-brand-navy">Notification Center</h1>
          <p className="text-xs text-brand-muted mt-1">
            Real-time updates on your doubt responses, office hours, and SLA escalation notices.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-blue-light text-brand-blue text-xs font-semibold hover:bg-blue-100 transition-colors border border-blue-200 self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark All as Read ({unreadCount})</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-brand-border shadow-sm overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Bell className="w-10 h-10 text-brand-muted mx-auto" />
            <div className="text-sm font-semibold text-brand-navy">No notifications</div>
            <p className="text-xs text-brand-muted">You're completely caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-brand-border">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => {
                  markAsRead(n.id);
                  if (n.link_url) navigate(n.link_url);
                }}
                className={`p-4 sm:p-5 flex items-start gap-4 hover:bg-brand-bg transition-colors cursor-pointer ${
                  !n.is_read ? 'bg-blue-50/40' : ''
                }`}
              >
                <div className="p-2.5 rounded-xl bg-white border border-brand-border shadow-xs mt-0.5">
                  {n.type === 'escalation' ? (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  ) : n.type === 'booking' ? (
                    <Calendar className="w-5 h-5 text-brand-blue" />
                  ) : (
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-brand-navy flex items-center gap-2">
                      <span>{n.title}</span>
                      {!n.is_read && (
                        <span className="w-2 h-2 rounded-full bg-brand-blue"></span>
                      )}
                    </h4>
                    <span className="text-[11px] text-brand-muted">
                      {new Date(n.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-brand-muted mt-1 leading-relaxed">
                    {n.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
