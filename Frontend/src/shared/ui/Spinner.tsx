import React from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-4',
  }[size];

  return (
    <div
      className={`inline-block ${sizeClasses} border-white/20 border-t-white rounded-full animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
};
