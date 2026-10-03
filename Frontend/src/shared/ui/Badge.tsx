import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'error' | 'gray';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'gray',
  className = '' 
}) => {
  const variantClasses = {
    primary: 'bg-accent/10 text-accent border-accent/20',
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    error: 'bg-red-500/10 text-red-400 border-red-500/20',
    gray: 'bg-surfaceHover text-secondary border-border',
  }[variant];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold border ${variantClasses} ${className}`}>
      {children}
    </span>
  );
};
