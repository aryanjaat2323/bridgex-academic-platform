import React from 'react';
import { DoubtUrgency } from '../../types';

interface UrgencyBadgeProps {
  urgency: DoubtUrgency | string;
  className?: string;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({ urgency, className = '' }) => {
  const u = urgency.toLowerCase();
  switch (u) {
    case 'deadline_approaching':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200 ${className}`}>
          ⚡ Deadline Approaching
        </span>
      );
    case 'important':
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 ${className}`}>
          ⚠️ Important
        </span>
      );
    case 'normal':
    default:
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 ${className}`}>
          Normal
        </span>
      );
  }
};
