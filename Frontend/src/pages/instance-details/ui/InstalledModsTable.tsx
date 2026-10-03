import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trash2, Globe, Monitor, Server, TriangleAlert, Layers, Loader2, Package, ArrowLeftRight, Download, MoreVertical, Sparkles } from 'lucide-react';
import { InstalledModDto, instanceApi, DeleteModImpactAnalysis, ModUpdateDto } from '@/entities/instance';
import { DataTable } from '@/shared/ui/Table';
import { invoke } from '@/shared/ipc/ipcClient';
import { Switch } from '@/shared/ui/Switch';
import { Button } from '@/shared/ui/Button';
import { useToastStore } from '@/shared/ui/Toast';

interface InstalledModsTableProps {
    mods: InstalledModDto[];
    instanceId: string;
    totalModsCount?: number;
    activeFilter?: 'all' | 'disabled' | 'updates';
    searchQuery?: string;
    updates?: Record<string, ModUpdateDto>;
    onRefresh: () => void;
}

export function InstalledModsTable({ mods, instanceId, totalModsCount, activeFilter, searchQuery, updates = {}, onRefresh }: InstalledModsTableProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const pageSize = 50;

    // Delete Modal State
    const [modToDelete, setModToDelete] = useState<InstalledModDto | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [deleteImpact, setDeleteImpact] = useState<DeleteModImpactAnalysis | null>(null);
    const [removeOrphans, setRemoveOrphans] = useState(true);
    const [removeStandaloneMods, setRemoveStandaloneMods] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [updatingProjectId, setUpdatingProjectId] = useState<string | null>(null);

    const filtered = mods.filter(m => !searchQuery || (m.modName || m.fileName).toLowerCase().includes(searchQuery.toLowerCase()));
    const paginated = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

    const handleToggle = async (fileName: string) => {
        try {
            await invoke('TOGGLE_MOD', { instanceId, fileName });
            onRefresh();
        } catch (e) {
            console.error(e);
        }
    };

    const handleNavigateToMod = (projectId?: string) => {
        if (projectId) {
            navigate(`/browser/mod/${projectId}?instanceId=${instanceId}`);
        }
    };

    const handleInitiateDelete = async (mod: InstalledModDto) => {
        setModToDelete(mod);
        setIsAnalyzing(true);
        setDeleteImpact(null);
        setRemoveOrphans(true);
        setRemoveStandaloneMods(false);
        try {
            const targetId = mod.projectId || mod.fileName;
            const impact = await instanceApi.analyzeModDelete(instanceId, targetId);
            setDeleteImpact(impact);
        } catch (err) {
            useToastStore.getState().addToast({ message: String(err), type: 'error' });
            setModToDelete(null);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!modToDelete) return;
        setIsDeleting(true);
        try {
            const targetId = modToDelete.projectId || modToDelete.fileName;
            await instanceApi.confirmModDelete(instanceId, targetId, removeOrphans, removeStandaloneMods);
            useToastStore.getState().addToast({ message: t('common.success', 'Мод успішно видалено'), type: 'success' });
            setModToDelete(null);
            onRefresh();
        } catch (err) {
            useToastStore.getState().addToast({ message: String(err), type: 'error' });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleApplyUpdate = async (row: InstalledModDto) => {
        const update = (row.projectId && updates[row.projectId]) || updates[row.fileName];
        if (!update || !update.hasUpdate || !update.latestVersionId) {
            useToastStore.getState().addToast({ message: t('dashboard.latestVersionInstalled', 'Встановлено найновішу сумісну версію!'), type: 'info' });
            return;
        }

        const confirmUpdate = window.confirm(`Оновити "${row.modName || row.fileName}" до версії ${update.latestVersion}?`);
        if (!confirmUpdate) return;

        setUpdatingProjectId(row.projectId || row.fileName);
        try {
            await instanceApi.applyModUpdate(instanceId, row.projectId || row.fileName, update.latestVersionId);
            useToastStore.getState().addToast({ message: `Оновлено до ${update.latestVersion}!`, type: 'success' });
            onRefresh();
        } catch (err) {
            useToastStore.getState().addToast({ message: String(err), type: 'error' });
        } finally {
            setUpdatingProjectId(null);
        }
    };

    const columns: any[] = [
        {
            key: 'name',
            header: t('common.name', 'НАЗВА'),
            className: 'flex-[2.8] min-w-[260px]',
            render: (row: InstalledModDto) => {
                const isClickable = Boolean(row.projectId);
                return (
                    <div 
                        className={`flex items-center gap-3 w-full group/mod ${isClickable ? 'cursor-pointer' : ''}`}
                        onClick={() => isClickable && handleNavigateToMod(row.projectId)}
                        title={isClickable ? t('dashboard.viewModDetails', 'Переглянути сторінку мода') : undefined}
                    >
                        {row.iconUrl ? (
                            <img 
                                src={row.iconUrl} 
                                alt={row.modName || 'icon'} 
                                className="w-10 h-10 rounded-xl object-cover bg-surface border border-border/60 shrink-0 shadow-sm transition-transform group-hover/mod:scale-105" 
                                onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                        ) : (
                            <div className="w-10 h-10 bg-surface rounded-xl border border-border/60 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover/mod:scale-105">
                                <Package className="w-5 h-5 text-secondary/60" />
                            </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                            <div className="flex items-center gap-2 truncate">
                                <span className={`font-bold text-[14px] truncate transition-colors ${isClickable ? 'group-hover/mod:text-accent' : ''} ${!row.isEnabled ? 'text-secondary line-through' : 'text-primary'}`}>
                                    {row.modName || row.fileName}
                                </span>
                                {row.author && (
                                    <span className="text-[11px] text-secondary/70 truncate shrink-0">
                                        by {row.author}
                                    </span>
                                )}
                                {row.isRoughDetection && (
                                    <span title="Визначено з назви файлу" className="text-secondary/50 shrink-0">
                                        <TriangleAlert className="w-3.5 h-3.5" />
                                    </span>
                                )}
                            </div>
                            <span 
                                className="text-[11px] text-secondary/60 max-w-[220px] sm:max-w-[260px] truncate block font-mono select-text cursor-text mt-0.5" 
                                onClick={e => e.stopPropagation()}
                                title={row.fileName}
                            >
                                {row.fileName}
                            </span>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'version',
            header: t('common.version', 'ВЕРСІЯ'),
            className: 'flex-[1.8] min-w-[170px]',
            render: (row: InstalledModDto) => {
                const env = (row.userEnvironmentOverride || row.autoEnvironment || 'Both').toLowerCase();
                const update = (row.projectId && updates[row.projectId]) || updates[row.fileName];
                return (
                    <div className="flex items-center gap-2.5">
                        <div className="flex flex-col min-w-0">
                            <span className="text-[12px] text-primary/90 truncate font-mono font-medium max-w-[110px]" title={row.version}>
                                {row.version ? row.version : 'Unknown'}
                            </span>
                            {update && update.hasUpdate && (
                                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 mt-0.5 animate-pulse" title={`Доступно оновлення: ${update.latestVersion}`}>
                                    <Sparkles className="w-2.5 h-2.5" /> → {update.latestVersion}
                                </span>
                            )}
                        </div>
                        <div className="flex flex-col gap-1 shrink-0 ml-auto">
                            <div className="flex justify-end">
                                {env === 'client' ? <span className="flex items-center justify-center gap-1 text-[9px] text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20 font-bold uppercase tracking-wider"><Monitor className="w-2.5 h-2.5"/> Client</span> :
                                 env === 'server' ? <span className="flex items-center justify-center gap-1 text-[9px] text-purple-400 bg-purple-400/10 px-1.5 py-0.5 rounded border border-purple-400/20 font-bold uppercase tracking-wider"><Server className="w-2.5 h-2.5"/> Server</span> :
                                 <span className="flex items-center justify-center gap-1 text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 font-bold uppercase tracking-wider"><Globe className="w-2.5 h-2.5"/> Both</span>}
                            </div>
                            <div className="flex justify-end gap-1">
                                {(row.projectType === 'library' || row.projectType === 'lib') && (
                                    <span className="flex items-center justify-center text-[9px] text-sky-400 bg-sky-400/10 px-1.5 py-0.5 rounded border border-sky-400/20 font-bold uppercase tracking-wider">lib</span>
                                )}
                                {row.isDirectInstall === false && (
                                    <span className="flex items-center justify-center text-[9px] text-accent bg-accent/10 px-1.5 py-0.5 rounded border border-accent/20 font-bold uppercase tracking-wider" title="Залежність (Dependency)"><Layers className="w-2.5 h-2.5"/></span>
                                )}
                            </div>
                        </div>
                    </div>
                );
            }
        },
        {
            key: 'source',
            header: t('common.source', 'ДЖЕРЕЛО'),
            className: 'flex-[0.8] min-w-[90px]',
            render: (row: InstalledModDto) => (
                <div className="flex items-center">
                    {row.source && row.source !== 'Unknown' ? (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary bg-surfaceHover px-2 py-0.5 rounded-full border border-border/80">
                            {row.source}
                        </span>
                    ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-secondary/50 px-2 py-0.5">
                            LOCAL
                        </span>
                    )}
                </div>
            )
        },
        {
            key: 'actions',
            header: t('common.actions', 'ДІЇ'),
            className: 'flex-[1.5] min-w-[160px] flex justify-end',
            render: (row: InstalledModDto) => {
                const update = (row.projectId && updates[row.projectId]) || updates[row.fileName];
                const hasUpdate = Boolean(update?.hasUpdate);
                const isCurrentlyUpdating = updatingProjectId === (row.projectId || row.fileName);

                return (
                    <div className="flex items-center justify-end gap-1.5">
                        <button 
                            onClick={() => handleNavigateToMod(row.projectId)}
                            className="p-1.5 text-secondary hover:text-accent transition-colors rounded-lg hover:bg-surface outline-none" 
                            title={t('dashboard.changeVersion', 'Змінити версію (відкрити в браузері)')}
                        >
                            <ArrowLeftRight className="w-4 h-4" />
                        </button>

                        <button 
                            onClick={() => handleApplyUpdate(row)}
                            disabled={isCurrentlyUpdating}
                            className={`p-1.5 transition-colors rounded-lg outline-none ${
                                hasUpdate 
                                    ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20' 
                                    : 'text-secondary/60 hover:text-emerald-400 hover:bg-surface'
                            }`}
                            title={hasUpdate ? `Оновити до ${update?.latestVersion}` : 'Оновити (перевірити найновішу версію)'}
                        >
                            {isCurrentlyUpdating ? (
                                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                        </button>

                        <div className="w-px h-5 bg-border/80 mx-1"></div>

                        <Switch
                            checked={row.isEnabled}
                            onChange={() => handleToggle(row.fileName)}
                        />
                        <button 
                            onClick={() => handleInitiateDelete(row)} 
                            className="p-1.5 text-secondary hover:text-red-400 transition-colors rounded-lg hover:bg-surface outline-none ml-1" 
                            title={t('common.delete', 'Видалити')}
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <button 
                            className="p-1 text-secondary/50 hover:text-primary transition-colors rounded-lg outline-none"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>
                    </div>
                );
            }
        }
    ];

    return (
        <div className="flex flex-col gap-4 relative">
            {mods.length === 0 ? (
                <div className="flex-1 bg-surface/10 border border-border rounded-2xl p-12 flex flex-col items-center justify-center text-secondary gap-3">
                    {activeFilter === 'updates' && (totalModsCount ?? 0) > 0 ? (
                        <>
                            <Sparkles className="w-10 h-10 text-emerald-400" />
                            <span className="text-sm font-bold text-primary">{t('dashboard.allModsUpdated', 'Всі моди оновлені!')}</span>
                            <span className="text-xs text-secondary">{t('dashboard.noUpdatesAvailable', 'Немає доступних оновлень для встановлених модів.')}</span>
                        </>
                    ) : activeFilter === 'disabled' && (totalModsCount ?? 0) > 0 ? (
                        <>
                            <Package className="w-10 h-10 text-secondary/40" />
                            <span className="text-sm font-medium">{t('dashboard.noDisabledMods', 'Немає вимкнених модів.')}</span>
                        </>
                    ) : (totalModsCount ?? 0) > 0 && searchQuery ? (
                        <>
                            <Package className="w-10 h-10 text-secondary/40" />
                            <span className="text-sm font-medium">{t('dashboard.noModsMatchSearch', 'Модів за вашим запитом не знайдено.')}</span>
                        </>
                    ) : (
                        <>
                            <Package className="w-10 h-10 text-secondary/40" />
                            <span className="text-sm font-medium">{t('dashboard.noModsInstalled', 'Ще не встановлено жодного моду.')}</span>
                        </>
                    )}
                </div>
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        data={paginated}
                        keyExtractor={(row) => row.fileName}
                    />
                    {filtered.length > pageSize && (
                        <div className="flex items-center justify-center gap-1 mt-4">
                            <button 
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-sm disabled:opacity-50"
                            >
                                {t('common.prev', 'Назад')}
                            </button>
                            <span className="text-sm font-medium text-secondary px-2">
                                {t('common.page', 'Сторінка')} {page} / {Math.ceil(filtered.length / pageSize)}
                            </span>
                            <button 
                                onClick={() => setPage(p => Math.min(Math.ceil(filtered.length / pageSize), p + 1))}
                                disabled={page === Math.ceil(filtered.length / pageSize)}
                                className="px-3 py-1.5 rounded-lg bg-surface border border-border text-sm disabled:opacity-50"
                            >
                                {t('common.next', 'Вперед')}
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Cascade Delete Impact Modal */}
            {modToDelete && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 flex flex-col gap-4 shadow-2xl relative">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-xl">
                                <Trash2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-primary">{t('mod_delete.title', 'Видалення моду')}</h3>
                                <p className="text-xs text-secondary">{modToDelete.modName || modToDelete.fileName}</p>
                            </div>
                        </div>

                        {isAnalyzing ? (
                            <div className="flex flex-col items-center justify-center py-8 gap-3 text-secondary">
                                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                                <span className="text-xs">{t('mod_delete.analyzing', 'Аналіз каскадних залежностей...')}</span>
                            </div>
                        ) : deleteImpact ? (
                            <div className="flex flex-col gap-4 text-sm">
                                {deleteImpact.brokenDependents.length > 0 && (
                                    <div className="p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl flex flex-col gap-2">
                                        <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
                                            <TriangleAlert className="w-4 h-4" />
                                            {t('mod_delete.warning_dependents', 'Увага: Цей мод необхідний для інших!')}
                                        </div>
                                        <p className="text-xs text-red-300">
                                            {t('mod_delete.dependents_desc', 'Наступні моди перестануть працювати після видалення:')}
                                        </p>
                                        <ul className="list-disc list-inside text-xs font-mono text-red-200">
                                            {deleteImpact.brokenDependents.map(d => (
                                                <li key={d.projectId}>{d.name} ({d.fileName})</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {deleteImpact.orphanedLibraries.length > 0 && (
                                    <div className="p-3.5 bg-accent/10 border border-accent/20 rounded-xl flex flex-col gap-2.5">
                                        <div className="flex items-center gap-2 text-accent font-bold text-xs uppercase tracking-wider">
                                            <Layers className="w-4 h-4" />
                                            {t('mod_delete.orphans_found', 'Виявлено неробочі сироти (Orphans)')}
                                        </div>
                                        <p className="text-xs text-secondary">
                                            {t('mod_delete.orphans_desc', 'Ці бібліотеки більше не потрібні жодному іншому моду:')}
                                        </p>
                                        <ul className="list-disc list-inside text-xs font-mono text-secondary/80">
                                            {deleteImpact.orphanedLibraries.map(o => (
                                                <li key={o.projectId}>{o.name} ({o.fileName})</li>
                                            ))}
                                        </ul>
                                        <label className="flex items-center gap-2.5 mt-1 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={removeOrphans} 
                                                onChange={(e) => setRemoveOrphans(e.target.checked)}
                                                className="rounded border-border bg-surface text-accent focus:ring-0"
                                            />
                                            <span className="text-xs font-semibold text-primary">
                                                {t('mod_delete.auto_remove_orphans', 'Видалити непотрібні бібліотеки разом із цим модом')}
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {deleteImpact.orphanedMods && deleteImpact.orphanedMods.length > 0 && (
                                    <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex flex-col gap-2.5">
                                        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                                            <Package className="w-4 h-4" />
                                            {t('mod_delete.orphaned_mods_found', 'Самостійні моди-залежності')}
                                        </div>
                                        <p className="text-xs text-secondary">
                                            {t('mod_delete.orphaned_mods_desc', 'Ці моди були встановлені автоматично як залежності, але є самостійними модами:')}
                                        </p>
                                        <ul className="list-disc list-inside text-xs font-mono text-secondary/80">
                                            {deleteImpact.orphanedMods.map(o => (
                                                <li key={o.projectId}>{o.name} ({o.fileName})</li>
                                            ))}
                                        </ul>
                                        <label className="flex items-center gap-2.5 mt-1 cursor-pointer select-none">
                                            <input 
                                                type="checkbox" 
                                                checked={removeStandaloneMods} 
                                                onChange={(e) => setRemoveStandaloneMods(e.target.checked)}
                                                className="rounded border-border bg-surface text-amber-500 focus:ring-0"
                                            />
                                            <span className="text-xs font-semibold text-amber-200">
                                                {t('mod_delete.remove_standalone_mods', 'Видалити також ці самостійні моди')}
                                            </span>
                                        </label>
                                    </div>
                                )}

                                {deleteImpact.isSafeToDelete && deleteImpact.orphanedLibraries.length === 0 && (!deleteImpact.orphanedMods || deleteImpact.orphanedMods.length === 0) && (
                                    <p className="text-xs text-secondary">
                                        {t('mod_delete.safe_desc', 'Цей мод не має залежних модулів. Видалення цілком безпечне.')}
                                    </p>
                                )}
                            </div>
                        ) : null}

                        <div className="flex items-center justify-end gap-2 mt-2">
                            <Button 
                                variant="secondary" 
                                onClick={() => setModToDelete(null)}
                                disabled={isDeleting}
                            >
                                {t('common.cancel', 'Скасувати')}
                            </Button>
                            <Button 
                                variant="danger" 
                                onClick={handleConfirmDelete}
                                disabled={isAnalyzing || isDeleting}
                                className="flex items-center gap-2"
                            >
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {t('common.delete', 'Видалити')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
