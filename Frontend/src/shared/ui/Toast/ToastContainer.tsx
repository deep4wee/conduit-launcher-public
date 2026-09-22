import { useToastStore } from './toastStore';
import { cn } from '@/shared/lib/utils';

export function ToastContainer() {
    const toasts = useToastStore(s => s.toasts);
    
    return (
        <div className="fixed bottom-6 right-6 z-[200] flex flex-col gap-3 pointer-events-none">
            {toasts.map(t => (
                <div key={t.id} className={cn("px-4 py-3 rounded-xl shadow-lg border text-sm font-medium animate-in slide-in-from-bottom-5 fade-in duration-300 pointer-events-auto", 
                    t.type === 'error' ? "bg-red-500/10 border-red-500/20 text-red-500" :
                    t.type === 'success' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                    "bg-surface border-border text-primary"
                )}>
                    {t.message}
                </div>
            ))}
        </div>
    );
}
    