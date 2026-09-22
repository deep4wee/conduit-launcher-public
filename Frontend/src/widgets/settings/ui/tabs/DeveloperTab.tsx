import { useTranslation } from 'react-i18next';
import { usePrefsStore } from '@/entities/prefs';
import { cn } from '@/shared/lib/utils';

export function DeveloperTab() {
    const { t } = useTranslation();
    const { debugMarkdown, setDebugMarkdown, enableNetworkTrace, setEnableNetworkTrace } = usePrefsStore();

    return (
        <div className="flex flex-col gap-3 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                <div className="flex flex-col pr-4">
                    <span className="font-bold">{t('settings.developer.markdown_debug')}</span>
                    <span className="text-xs text-secondary">{t('settings.developer.markdown_debug_desc')}</span>
                </div>
                <button
                    onClick={() => setDebugMarkdown(!debugMarkdown)}
                    className={cn("w-12 h-6 rounded-full transition-colors relative outline-none shrink-0", debugMarkdown ? "bg-accent" : "bg-border")}
                >
                    <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-transform", debugMarkdown ? "translate-x-7" : "translate-x-1")} />
                </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl">
                <div className="flex flex-col pr-4">
                    <span className="font-bold">{t('settings.developer.network_trace')}</span>
                    <span className="text-xs text-secondary">{t('settings.developer.network_trace_desc')}</span>
                </div>
                <button
                    onClick={() => setEnableNetworkTrace(!enableNetworkTrace)}
                    className={cn("w-12 h-6 rounded-full transition-colors relative outline-none shrink-0", enableNetworkTrace ? "bg-accent" : "bg-border")}
                >
                    <div className={cn("w-4 h-4 rounded-full bg-white absolute top-1 transition-transform", enableNetworkTrace ? "translate-x-7" : "translate-x-1")} />
                </button>
            </div>
        </div>
    );
}
    