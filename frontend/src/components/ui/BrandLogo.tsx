import React from 'react';
import { Link } from 'react-router-dom';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  whiteText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ className = '', size = 'md', whiteText = false }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <Link to="/" className={`flex items-center gap-2.5 font-bold tracking-tight ${className}`}>
      <div className={`${iconSizes[size]} flex items-center justify-center bg-brand-navy rounded-lg p-1.5 shadow-sm`}>
        <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
          {/* Bridge arch */}
          <path d="M4 23C9 14 23 14 28 23" stroke="#356AE6" strokeWidth="3" strokeLinecap="round" />
          {/* Bridge deck */}
          <path d="M2 24.5H30" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          {/* Suspension cables */}
          <path d="M10 18.5V24.5M16 15.5V24.5M22 18.5V24.5" stroke="#356AE6" strokeWidth="2" strokeLinecap="round" />
          {/* Connection node */}
          <circle cx="16" cy="7.5" r="3" fill="#356AE6" />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`${textSizes[size]} font-extrabold tracking-tight ${whiteText ? 'text-white' : 'text-brand-navy'}`}>
          Bridge<span className="text-brand-blue">X</span>
        </span>
      </div>
    </Link>
  );
};
