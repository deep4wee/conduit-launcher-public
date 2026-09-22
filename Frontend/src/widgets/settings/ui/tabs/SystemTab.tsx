import { useTranslation } from 'react-i18next';
import { usePrefsStore } from '@/entities/prefs';
import { cn } from '@/shared/lib/utils';

export function SystemTab() {
    const { t } = useTranslation();
    const { useSystemBrowser, setUseSystemBrowser } = usePrefsStore();

    return (
        <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
            <section>
                <h3 className="text-xl font-bold">{t('settings.system.browser_routing')}</h3>
                <p className="text-sm text-secondary mb-6 mt-1">{t('settings.system.browser_routing_desc')}</p>
                <div className="flex flex-col gap-3 max-w-sm">
                    <button
                        onClick={() => setUseSystemBrowser(true)}
                        className={cn(
                            "px-6 py-4 rounded-xl font-medium transition-all text-left border-2 outline-none",
                            useSystemBrowser ? "border-accent bg-accent/5 text-primary" : "border-border hover:border-secondary bg-surface text-secondary"
                        )}
                    >
                        {t('settings.system.system_browser')}
                    </button>
                    <button
                        onClick={() => setUseSystemBrowser(false)}
                        className={cn(
                            "px-6 py-4 rounded-xl font-medium transition-all text-left border-2 outline-none",
                            !useSystemBrowser ? "border-accent bg-accent/5 text-primary" : "border-border hover:border-secondary bg-surface text-secondary"
                        )}
                    >
                        {t('settings.system.in_app')}
                    </button>
                </div>
            </section>
        </div>
    );
}
    