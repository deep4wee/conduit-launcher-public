import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, FolderOpen, Coffee, Trash2, Download } from 'lucide-react';
import { useJavaStore } from '@/entities/java';
import { Button } from '@/shared/ui/Button';
import { Select } from '@/shared/ui/Select';
import { cn } from '@/shared/lib/utils';

export function JavaTab() {
    const { t } = useTranslation();
    const { settings, detectedRuntimes, isDetecting, detectAll, browsePath, setJavaMapping, removeRuntime, installRecommended } = useJavaStore();
    const [installingMajor, setInstallingMajor] = useState<number | null>(null);

    useEffect(() => {

        // Автоматично шукаємо при першому відкритті, якщо список пустий
        if (detectedRuntimes.length === 0 && !isDetecting) {
            detectAll();
        }
    }, []);

    const renderMappingSelect = (major: 8 | 17 | 21, title: string) => {
        const selectedValue = settings[`defaultJava${major}`];

        // Фільтруємо підходящі версії (для 21 підійде все що >= 21)
        const compatibleRuntimes = detectedRuntimes.filter(r =>
            major >= 21 ? r.majorVersion >= 21 : r.majorVersion === major
        );

        const isInstalling = installingMajor === major;

        return (
            <div className="flex flex-col gap-3 bg-surface p-4 rounded-xl border border-border shadow-sm">
                <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-sm text-primary">{title}</span>
                    <span className="text-xs text-secondary bg-background px-2 py-0.5 rounded border border-border">Default</span>
                </div>

                <Select
                    value={selectedValue}
                    onChange={(e) => setJavaMapping(major, e.target.value)}
                    className="w-full font-mono text-xs"
                >
                    <option value="">{t('settings.java.not_selected', '-- Not Selected --')}</option>
                    {compatibleRuntimes.map(rt => (
                        <option key={rt.path} value={rt.path}>
                            Java {rt.majorVersion} ({rt.version}) - {rt.path.length > 50 ? '...' + rt.path.slice(-47) : rt.path}
                        </option>
                    ))}
                    {selectedValue && !compatibleRuntimes.find(r => r.path === selectedValue) && (
                        <option value={selectedValue}>{selectedValue}</option>
                    )}
                </Select>

                <div className="flex justify-end mt-1">
                    <Button
                        variant="secondary"
                        className="flex items-center gap-2 px-3 py-1.5 text-xs shadow-sm"
                        disabled={isInstalling}
                        onClick={async () => {
                            setInstallingMajor(major);
                            await installRecommended(major);
                            setInstallingMajor(null);
                        }}
                    >
                        {isInstalling ? <div className="w-3 h-3 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <Download className="w-3 h-3" />}
                        {t('settings.java.install_recommended', 'Install recommended')}
                    </Button>
                </div>
            </div>
        );
    };


    return (
        <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300 pb-10">

            <section>
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h3 className="text-xl font-bold">{t('settings.java.detected_title', 'Detected Java Runtimes')}</h3>
                        <p className="text-sm text-secondary mt-1">{t('settings.java.detected_desc', 'List of all Java versions found on this computer.')}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <Button variant="secondary" onClick={() => detectAll()} disabled={isDetecting} className="flex items-center gap-2">
                            {isDetecting ? <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <Search className="w-4 h-4 text-secondary" />}
                            <span className="hidden sm:inline">{t('settings.java.detect', 'Auto Detect')}</span>
                        </Button>

                        <Button variant="secondary" onClick={() => browsePath()} className="flex items-center gap-2">
                            <FolderOpen className="w-4 h-4" />
                            <span className="hidden sm:inline">{t('settings.java.browse', 'Add Custom')}</span>
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col border border-border rounded-xl bg-surface/50 overflow-hidden shadow-sm">
                    {detectedRuntimes.length === 0 ? (
                        <div className="p-8 text-center text-secondary">
                            <Coffee className="w-8 h-8 mx-auto mb-3 opacity-50" />
                            <p>{isDetecting ? t('settings.java.searching', 'Scanning disk...') : t('settings.java.no_java', 'No Java runtimes found.')}</p>
                        </div>
                    ) : (
                        <div className="flex flex-col divide-y divide-border/50 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {detectedRuntimes.map((rt, i) => (
                                <div key={i} className="flex items-center p-3 hover:bg-surface transition-colors group gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                                        <Coffee className={cn("w-5 h-5", rt.isValid ? "text-green-500" : "text-red-500")} />
                                    </div>
                                    <div className="flex flex-col flex-1 min-w-0">
                                        <span className="font-bold text-primary text-sm flex items-center gap-2">
                                            Java {rt.majorVersion}
                                            <span className="text-xs font-normal text-secondary bg-background px-2 py-0.5 rounded border border-border">{rt.version}</span>
                                        </span>
                                        <span className="text-xs text-secondary font-mono truncate mt-0.5" title={rt.path}>{rt.path}</span>
                                    </div>
                                    <button
                                        onClick={() => removeRuntime(rt.path)}
                                        className="w-8 h-8 flex items-center justify-center rounded-lg text-secondary hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            <div className="h-px bg-border/50" />

            <section>
                <h3 className="text-xl font-bold mb-4">{t('settings.java.mapping_title', 'Game Version Mappings')}</h3>
                <div className="grid grid-cols-1 gap-3">
                    {renderMappingSelect(21, 'Modern Minecraft (1.20.5+)')}
                    {renderMappingSelect(17, 'New Minecraft (1.17 - 1.20.4)')}
                    {renderMappingSelect(8, 'Legacy Minecraft (1.16.5 and below)')}
                </div>
            </section>
        </div>
    );
}
