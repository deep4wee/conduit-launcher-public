import { useEffect } from 'react';
import { HardDrive, FolderOpen, Box } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useStorageStore } from '@/entities/storage';
import { formatBytes } from '@/shared/lib/helpers/formatBytes';
import { usePrefsStore } from '@/entities/prefs';
import { Button } from '@/shared/ui/Button';

export function StorageSettingsTab() {
    const { t } = useTranslation();
    const { metrics, isLoading, fetchMetrics } = useStorageStore();
    const { openExternalUrl, maxConcurrentDownloads, setMaxConcurrentDownloads } = usePrefsStore();

    useEffect(() => {
        fetchMetrics();
    }, [fetchMetrics]);

    if (isLoading || !metrics) {
        return (
            <div className="flex justify-center items-center h-48 animate-pulse text-secondary">
                <HardDrive className="w-8 h-8 mr-3 opacity-50" />
                <span>{t('settings.storage.loading', 'Calculating storage...')}</span>
            </div>
        );
    }

    const totalGB = formatBytes(metrics.totalSpace);
    const freeGB = formatBytes(metrics.freeSpace);
    const launcherGB = formatBytes(metrics.launcherSpace);

    const launcherPct = (metrics.launcherSpace / metrics.totalSpace) * 100;
    const otherPct = (metrics.otherSpace / metrics.totalSpace) * 100;
    const freePct = (metrics.freeSpace / metrics.totalSpace) * 100;    

    return (
        <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
            
            {/* Секція: Папка додатку */}
            
            <section>
                <h3 className="text-xl font-bold">{t('settings.storage.app_dir', 'App directory')}</h3>
                <p className="text-sm text-secondary mb-4 mt-1">{t('settings.storage.app_dir_desc', 'The directory where the launcher stores all of its files. Changes will be applied after restarting.')}</p>
                
                <div className="flex items-center gap-3 bg-surface border border-border rounded-xl p-2 pl-4 shadow-sm">
                    <Box className="w-5 h-5 text-secondary shrink-0" />
                    <input 
                        type="text" 
                        readOnly 
                        value={metrics.rootPath} 
                        className="flex-1 bg-transparent border-none text-sm font-medium text-primary focus:outline-none truncate"
                    />
                    <Button variant="secondary" className="shrink-0" onClick={() => console.log("TODO: Open folder picker")}>
                        <FolderOpen className="w-4 h-4 mr-2 inline-block" />
                        {t('settings.storage.browse', 'Browse')}
                    </Button>
                </div>
            </section>

            <div className="h-px bg-border/50" />

            {/* Секція: Прогрес бар пам'яті */}
            <section>
                <h3 className="text-xl font-bold">{t('settings.storage.disk_usage', 'Disk Usage')}</h3>
                
                <div className="bg-surface border border-border rounded-xl p-5 shadow-sm mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center gap-3">
                            <HardDrive className="w-6 h-6 text-secondary" />
                            <span className="font-bold text-primary">{t('settings.storage.local_disk', 'Local Disk')} ({metrics.driveName})</span>
                        </div>
                        <span className="text-sm font-bold text-secondary uppercase tracking-wide">
                            {t('settings.storage.free_out_of', 'Free {{free}} of {{total}}').replace('{{free}}', freeGB).replace('{{total}}', totalGB)}
                        </span>
                    </div>

                    <div className="w-full h-4 bg-background rounded-full overflow-hidden flex shadow-inner border border-border">
            
                        <div style={{ width: `${launcherPct}%` }} className="bg-accent h-full transition-all duration-1000 ease-out" title={`Launcher: ${launcherGB}`} />
                        <div style={{ width: `${otherPct}%` }} className="bg-secondary opacity-50 h-full transition-all duration-1000 ease-out" title="Other files" />
                        <div style={{ width: `${freePct}%` }} className="bg-transparent h-full" />
                    </div>

                    <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-accent" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('settings.storage.launcher_data', 'Launcher Data')}</span>
                            <span className="text-xs text-secondary ml-1">{launcherGB}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-secondary opacity-50" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('settings.storage.other_files', 'Other Files')}</span>
                            <span className="text-xs text-secondary ml-1">{formatBytes(metrics.otherSpace)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full border-2 border-border" />
                            <span className="text-xs font-bold text-primary uppercase tracking-wider">{t('settings.storage.free_space', 'Free Space')}</span>
                            <span className="text-xs text-secondary ml-1">{freeGB}</span>
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-px bg-border/50" />

                        <section>
                <div className="flex items-center justify-between p-4 bg-surface border border-border rounded-xl hover:border-secondary transition-colors cursor-pointer group" onClick={() => openExternalUrl(`file:///${metrics.rootPath.replace(/\\/g, '/')}`)}>
                    <div className="flex flex-col pr-4">
                        <span className="font-bold flex items-center gap-2">
                            <FolderOpen className="w-4 h-4 text-secondary group-hover:text-accent transition-colors" />
                            {t('settings.storage.open_folder', 'Open Application Folder')}
                        </span>
                        <span className="text-xs text-secondary mt-1">{t('settings.storage.open_folder_desc', 'Browse instances, mods, and cache directly.')}</span>
                    </div>
                </div>
            </section>

            <div className="h-px bg-border/50" />

            <section>
                <h3 className="text-xl font-bold">{t('settings.storage.concurrent_downloads', 'Maximum concurrent downloads')}</h3>
                <p className="text-sm text-secondary mb-4 mt-1">{t('settings.storage.concurrent_desc', 'The maximum amount of files the launcher can download at the same time. Set this to a lower value if you have a poor internet connection.')}</p>
                
                <div className="flex items-center gap-4 bg-surface border border-border rounded-xl p-4 shadow-sm">
                    <input 
                        type="range" 
                        min="1" 
                        max="20" 
                        value={maxConcurrentDownloads} 
                        onChange={(e) => setMaxConcurrentDownloads(parseInt(e.target.value))}
                        className="flex-1 accent-accent h-2 bg-background rounded-full appearance-none outline-none"
                    />
                    <div className="w-12 h-8 bg-background border border-border rounded-lg flex items-center justify-center font-bold text-primary shadow-inner">
                        {maxConcurrentDownloads}
                    </div>
                </div>
            </section>
        </div>
    );
}
            
    