import { useState, useRef, ReactNode } from 'react';
import { cn } from '@/shared/lib/utils';
import { useClickOutside } from '@/shared/lib/hooks/useClickOutside';

interface DropdownProps {
    trigger: ReactNode;
    children: ReactNode;
    align?: 'left' | 'right';
    className?: string;
}

export function Dropdown({ trigger, children, align = 'left', className }: DropdownProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useClickOutside(dropdownRef, () => setIsOpen(false));

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
                {trigger}
            </div>

                        {isOpen && (
                <div
                    className={cn(
                        "absolute top-full mt-2 min-w-48 max-w-[calc(100vw-2rem)] overflow-hidden bg-surface border border-border rounded-xl shadow-lg z-50 flex flex-col p-1 animate-in fade-in slide-in-from-top-2 duration-200",
                        align === 'right' ? 'right-0' : 'left-0',
                        className
                    )}
                    onClick={() => setIsOpen(false)} // Закривати після вибору
                >
                    {children}
                </div>
            )}
            
        </div>
    );
}
    