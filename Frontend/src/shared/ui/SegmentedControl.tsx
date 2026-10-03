import React from 'react';

export interface SegmentedControlOption {
  label: string;
  value: string;
}

export interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
  options,
  value,
  onChange,
  className = ''
}) => {
  return (
    <div className={`flex p-1 bg-surfaceHover rounded-xl border border-border ${className}`}>
      {options.map((option) => {
        const isSelected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`flex-1 py-1.5 px-3 text-sm font-bold rounded-lg transition-colors ${
              isSelected
                ? 'bg-surface text-primary shadow-sm border border-border/50'
                : 'text-secondary hover:text-primary hover:bg-surface/50 border border-transparent'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
};
