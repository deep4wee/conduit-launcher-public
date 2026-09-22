import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "px-4 py-2 rounded-md font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed",
                    variant === 'primary' && "bg-accent text-[#11111b] hover:bg-opacity-90",
                    variant === 'secondary' && "bg-surface text-primary hover:bg-surface/80",
                    variant === 'danger' && "bg-red-500 text-white hover:bg-red-600",
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = 'Button';
    