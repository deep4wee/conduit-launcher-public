import { useState } from 'react';
import { X, Package, CheckCircle2, Circle, TriangleAlert } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { InstalledModDto } from '@/entities/instance';
import { cn } from '@/shared/lib/utils';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    instanceId: string;
    mods: InstalledModDto[];
}

export function ExportModpackModal({ isOpen, onClose, instanceId, mods }: Props) {
    const { t } = useTranslation();
    const [exportType, setExportType] = useState<'Client' | 'Server'>('Client');
    const [overrides, setOverrides] = useState<Record<string, string>>({});

    if (!isOpen) return null;

    const handleExport = () => {
        // Mock export logic, since backend doesn't have an export IPC yet
        alert(`Exporting ${exportType} modpack for instance ${instanceId}. Overrides: ${JSON.stringify(overrides)}`);
        onClose();
    };

    const toggleEnv = (fileName: string, targetEnv: string) => {
        setOverrides(prev => ({
            ...prev,
            [fileName]: targetEnv
        }));
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-4xl rounded-2xl shadow-2xl border border-border flex flex-col relative overflow-hidden h-[80vh]">
                <div className="flex items-center justify-between p-5 border-b border-border bg-surfaceHover/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
                            <Package className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-primary">{t('export.title', 'Export Modpack')}</h2>
                            <p className="text-xs text-secondary font-medium">{t('export.subtitle', 'Configure and export your modpack')}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-surface transition-colors outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-64 border-r border-border bg-surfaceHover/10 p-5 flex flex-col gap-6 shrink-0">
                        <div>
                            <label className="text-xs font-bold text-secondary uppercase tracking-wider mb-3 block">
                                {t('export.target', 'Target Environment')}
                            </label>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => setExportType('Client')}
                                    className={cn("text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all", exportType === 'Client' ? "border-accent bg-accent/10 text-accent" : "border-border text-secondary hover:border-border/80")}
                                >
                                    {t('export.client', 'Client (For playing)')}
                                </button>
                                <button 
                                    onClick={() => setExportType('Server')}
                                    className={cn("text-left px-4 py-3 rounded-xl border text-sm font-bold transition-all", exportType === 'Server' ? "border-accent bg-accent/10 text-accent" : "border-border text-secondary hover:border-border/80")}
                                >
                                    {t('export.server', 'Server (For hosting)')}
                                </button>
                            </div>
                        </div>

                        <div className="text-xs text-secondary mt-auto bg-surface p-3 rounded-lg border border-border/50 leading-relaxed">
                            {exportType === 'Server' 
                                ? t('export.serverHint', 'Server export will automatically exclude mods tagged strictly as "Client", such as visual enhancements and minimaps.') 
                                : t('export.clientHint', 'Client export will include all mods necessary to connect to a server and play.')}
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col overflow-hidden bg-background">
                        <div className="p-4 border-b border-border bg-surfaceHover/10 flex items-center justify-between shrink-0">
                            <h3 className="font-bold text-sm text-primary">{t('export.modConfig', 'Mod Configuration')}</h3>
                            <div className="flex items-center gap-4 text-xs font-medium text-secondary">
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-accent" /> {t('export.auto', 'Auto-detected')}</span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
                            <table className="w-full text-left text-sm whitespace-nowrap border-collapse">
                                <thead className="bg-surface/50 border-b border-border sticky top-0 z-10">
                                    <tr>
                                        <th className="px-4 py-3 font-bold text-secondary text-xs uppercase tracking-wider">{t('common.mod', 'Mod')}</th>
                                        <th className="px-4 py-3 font-bold text-secondary text-xs uppercase tracking-wider text-center">Client</th>
                                        <th className="px-4 py-3 font-bold text-secondary text-xs uppercase tracking-wider text-center">Server</th>
                                        <th className="px-4 py-3 font-bold text-secondary text-xs uppercase tracking-wider text-center">Both</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {mods.map(mod => {
                                        const originalEnv = mod.autoEnvironment || 'Both';
                                        const currentEnv = overrides[mod.fileName] || mod.userEnvironmentOverride || originalEnv;
                                        const isAuto = !overrides[mod.fileName] && !mod.userEnvironmentOverride;

                                        return (
                                            <tr key={mod.fileName} className="hover:bg-surface/30 transition-colors">
                                                <td className="px-4 py-3 max-w-[200px] truncate text-primary font-medium flex items-center gap-2">
                                                    {mod.modName || mod.fileName}
                                                    {mod.isRoughDetection && (
                                                        <span title={t('dashboard.roughDetection', 'Rough detection')}>
                                                            <TriangleAlert className="w-3 h-3 text-orange-400" />
                                                        </span>
                                                    )}
                                                    {isAuto && <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Auto</span>}
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => toggleEnv(mod.fileName, 'Client')} className="outline-none">
                                                        {currentEnv === 'Client' ? <CheckCircle2 className="w-5 h-5 mx-auto text-accent" /> : <Circle className="w-5 h-5 mx-auto text-secondary/40" />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => toggleEnv(mod.fileName, 'Server')} className="outline-none">
                                                        {currentEnv === 'Server' ? <CheckCircle2 className="w-5 h-5 mx-auto text-accent" /> : <Circle className="w-5 h-5 mx-auto text-secondary/40" />}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3 text-center">
                                                    <button onClick={() => toggleEnv(mod.fileName, 'Both')} className="outline-none">
                                                        {currentEnv === 'Both' ? <CheckCircle2 className="w-5 h-5 mx-auto text-accent" /> : <Circle className="w-5 h-5 mx-auto text-secondary/40" />}
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-border bg-surfaceHover/30 flex justify-end gap-3 shrink-0">
                    <Button variant="secondary" onClick={onClose}>
                        {t('common.cancel', 'Cancel')}
                    </Button>
                    <Button variant="primary" onClick={handleExport} className="px-6">
                        {t('dashboard.export', 'Export modpack')}
                    </Button>
                </div>
            </div>
        </div>
    );
}
