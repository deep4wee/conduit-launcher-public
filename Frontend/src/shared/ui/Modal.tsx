import React, { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  customHeader?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  customHeader,
  children,
  footer,
  maxWidth = 'md',
}) => {
  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Modal Dialog */}
      <div className={`relative w-full ${maxWidthClass} bg-surface border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]`}>
        {/* Header */}
        {customHeader ? (
          customHeader
        ) : (
          <div className="flex items-center justify-between p-5 border-b border-border bg-surfaceHover/30 shrink-0">
            {title && <h3 className="text-lg font-bold text-primary">{title}</h3>}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-surface transition-colors outline-none"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Body */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-border bg-surfaceHover/30 flex items-center justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
