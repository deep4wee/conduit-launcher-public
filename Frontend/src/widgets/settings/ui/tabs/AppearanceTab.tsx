import { useTranslation } from 'react-i18next';
import { usePrefsStore } from '@/entities/prefs';
import { cn } from '@/shared/lib/utils';

export function AppearanceTab() {
    const { t } = useTranslation();
    const { theme, setTheme, uiScale, setUiScale, fontFamily, setFontFamily } = usePrefsStore();

    return (
        <div className="flex flex-col gap-10 animate-in slide-in-from-right-4 duration-300">
            <section>
                <h3 className="text-xl font-bold">{t('settings.appearance.theme')}</h3>
                <p className="text-sm text-secondary mb-6 mt-1">{t('settings.appearance.themeDesc')}</p>

                <div className="flex flex-wrap gap-4">
                    {(['dark', 'light', 'oled', 'dracula', 'nord'] as const).map((tOption) => (
                        <button
                            key={tOption}
                            onClick={() => setTheme(tOption)}
                            className={cn(
                                "group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all outline-none w-[140px]",
                                theme === tOption ? "border-accent bg-accent/5" : "border-border hover:border-secondary bg-surface"
                            )}
                        >
                            <div className={cn(
                                "w-full h-24 rounded-lg border flex flex-col overflow-hidden shadow-inner",
                                tOption === 'dark' ? "bg-[#11111b] border-[#313244]" :
                                tOption === 'oled' ? "bg-black border-[#27272a]" :
                                tOption === 'dracula' ? "bg-[#282a36] border-[#6272a4]" :
                                tOption === 'nord' ? "bg-[#2e3440] border-[#4c566a]" :
                                "bg-white border-gray-200"
                            )}>
                                <div className={cn("h-6 w-full opacity-50", tOption === 'light' ? "bg-gray-100" : "bg-white/5")} />
                                <div className="flex-1 flex gap-2 p-2">
                                    <div className={cn("w-6 h-full rounded", tOption === 'light' ? "bg-gray-200" : "bg-white/10")} />
                                    <div className="flex-1 flex flex-col gap-2">
                                        <div className={cn("h-4 w-3/4 rounded", tOption === 'light' ? "bg-gray-200" : "bg-white/10")} />
                                        <div className={cn("h-4 w-1/2 rounded", tOption === 'light' ? "bg-gray-200" : "bg-white/10")} />
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 font-medium">
                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", theme === tOption ? "border-accent" : "border-secondary")}>
                                    {theme === tOption && <div className="w-2 h-2 bg-accent rounded-full" />}
                                </div>
                                {t(`settings.appearance.${tOption}`)}
                            </div>
                        </button>
                    ))}
                </div>
            </section>

            <div className="h-px bg-border/50" />

            <section>
                <h3 className="text-xl font-bold">{t('settings.appearance.font')}</h3>
                <p className="text-sm text-secondary mb-6 mt-1">{t('settings.appearance.fontDesc')}</p>
                <div className="grid grid-cols-2 gap-4">
                    {(['inter', 'poppins', 'jetbrains', 'system'] as const).map((fOption) => (
                        <button
                            key={fOption}
                            onClick={() => setFontFamily(fOption)}
                            className={cn(
                                "px-4 py-3 rounded-xl font-medium transition-all text-left border-2 outline-none",
                                fontFamily === fOption ? "border-accent bg-accent/5 text-primary" : "border-border hover:border-secondary bg-surface text-secondary"
                            )}
                        >
                            {t(`settings.appearance.font_${fOption}`)}
                        </button>
                    ))}
                </div>
            </section>

            <div className="h-px bg-border/50" />

            <section>
                <h3 className="text-xl font-bold">{t('settings.appearance.scale')}</h3>
                <p className="text-sm text-secondary mb-6 mt-1">{t('settings.appearance.scaleDesc')}</p>
                <div className="flex gap-3">
                    {[0.75, 1.0, 1.25, 1.5].map((scale) => (
                        <button
                            key={scale}
                            onClick={() => setUiScale(scale)}
                            className={cn(
                                "px-6 py-2 rounded-lg font-medium transition-colors border outline-none",
                                uiScale === scale
                                    ? "bg-accent border-accent text-[#11111b]"
                                    : "bg-surface border-border hover:border-secondary text-secondary"
                            )}
                        >
                            {scale * 100}%
                        </button>
                    ))}
                </div>
            </section>
        </div>
    );
}
    