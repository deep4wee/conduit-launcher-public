import { useTranslation } from 'react-i18next';
import { usePrefsStore } from '@/entities/prefs';
import { cn } from '@/shared/lib/utils';

export function LanguageTab() {
    const { t } = useTranslation();
    const { language, setLanguage } = usePrefsStore();

    return (
        <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
            <section>
                <h3 className="text-xl font-bold">{t('settings.language.title')}</h3>
                <p className="text-sm text-secondary mb-6 mt-1">{t('settings.language.desc')}</p>
                <div className="flex flex-col gap-3 max-w-sm">
                    <button
                        onClick={() => setLanguage('uk')}
                        className={cn(
                            "px-6 py-4 rounded-xl font-medium transition-all text-left border-2 outline-none",
                            language === 'uk' ? "border-accent bg-accent/5 text-primary" : "border-border hover:border-secondary bg-surface text-secondary"
                        )}
                    >
                        {t('settings.language.uk')}
                    </button>
                    <button
                        onClick={() => setLanguage('en')}
                        className={cn(
                            "px-6 py-4 rounded-xl font-medium transition-all text-left border-2 outline-none",
                            language === 'en' ? "border-accent bg-accent/5 text-primary" : "border-border hover:border-secondary bg-surface text-secondary"
                        )}
                    >
                        {t('settings.language.en')}
                    </button>
                </div>
            </section>
        </div>
    );
}
    