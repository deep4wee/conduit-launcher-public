import React, { InputHTMLAttributes, forwardRef } from 'react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, icon, ...props }, ref) => {
    return (
      <div className="relative w-full flex flex-col gap-1">
        <div className="relative w-full">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-secondary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-surfaceHover border ${
              error ? 'border-red-500 focus:border-red-500' : 'border-border focus:border-accent'
            } rounded-xl text-primary placeholder:text-secondary focus:outline-none transition-colors ${
              icon ? 'pl-10' : 'px-3'
            } py-2 ${className}`}
            {...props}
          />
        </div>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
