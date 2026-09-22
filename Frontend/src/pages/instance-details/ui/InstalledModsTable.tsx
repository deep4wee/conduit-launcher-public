import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, ExternalLink, Globe, Monitor, Server, RefreshCw, TriangleAlert } from 'lucide-react';
import { InstalledModDto, instanceApi } from '@/entities/instance';
import { DataTable } from '@/shared/ui/Table';
import { cn } from '@/shared/lib/utils';
import { invoke } from '@/shared/ipc/ipcClient';

export function formatBytes(bytes: number | undefined | null, decimals = 2) {
    if (!bytes || isNaN(Number(bytes)) || Number(bytes) <= 0) return '0 Bytes';
    const num = Number(bytes);
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(num) / Math.log(k));
    return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + ' ' + (sizes[i] || 'Bytes');
}

export function Switch({ checked, onChange }: { checked: boolean, onChange: () => void }) {
    return (
        <button 
            type="button" 
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                checked ? "bg-accent" : "bg-border"
            )}
        >
            <span
                className={cn(
                    "pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform",
                    checked ? "translate-x-4" : "translate-x-0"
                )}
            />
        </button>
    );
}

interface Props {
    instanceId: string;
    mods: InstalledModDto[];
    searchQuery: string;
    onRefresh: () => void;
}

export function InstalledModsTable({ instanceId, mods, searchQuery, onRefresh }: Props) {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const pageSize = 15;

    const filtered = useMemo(() => {
        if (!searchQuery) return mods;
        const q = searchQuery.toLowerCase();
        return mods.filter(m => 
            m.fileName.toLowerCase().includes(q) || 
            (m.modName && m.modName.toLowerCase().includes(q))
        );
    }, [mods, searchQuery]);

    const paginated = useMemo(() => {
        const start = (page - 1) * pageSize;
        return filtered.slice(start, start + pageSize);
    }, [filtered, page]);

    const handleToggle = async (fileName: string) => {
        try {
            await instanceApi.toggleMod(instanceId, fileName);
            onRefresh();
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (fileName: string) => {
        try {
            await instanceApi.deleteMod(instanceId, fileName);
            onRefresh();
        } catch (e) {
            console.error(e);
        }
    };

    const columns: any[] = [
        {
            key: 'name',
            header: t('common.name', 'Name'),
            render: (row: InstalledModDto) => (
                <div className="flex items-center gap-3 w-[280px]">
                    <div className="w-10 h-10 bg-surface rounded-lg border border-border/50 flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] font-bold text-secondary uppercase">{(row.fileName || '').split('.').pop()?.replace('disabled', 'jar') || 'jar'}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span className={`font-bold text-sm truncate flex items-center gap-2 ${!row.isEnabled ? 'text-secondary line-through' : 'text-primary'}`}>
                            {row.modName || row.fileName}
                            {row.isRoughDetection && (
                                <span title={t('dashboard.roughDetection', 'Metadata extracted roughly from .jar file')}>
                                    <TriangleAlert className="w-4 h-4 text-orange-400" />
                                </span>
                            )}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-secondary mt-0.5 truncate">
                            {row.source === 'Modrinth' && <Globe className="w-3 h-3 text-accent" />}
                            {row.source === 'CurseForge' && <Globe className="w-3 h-3 text-orange-500" />}
                            <span>{row.version || t('common.unknown', 'Unknown')}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            key: 'environment',
            header: t('dashboard.environment', 'Environment'),
            render: (row: InstalledModDto) => {
                const env = row.userEnvironmentOverride || row.autoEnvironment || 'Both';
                return (
                    <div className="flex items-center gap-1.5 w-[120px]">
                        {env === 'Client' && <Monitor className="w-4 h-4 text-blue-400" />}
                        {env === 'Server' && <Server className="w-4 h-4 text-red-400" />}
                        {env === 'Both' && <RefreshCw className="w-4 h-4 text-secondary" />}
                        <span className="text-xs font-bold text-secondary">{env}</span>
                    </div>
                );
            }
        },
        {
            key: 'size',
            header: t('common.size', 'Size'),
            render: (row: InstalledModDto) => (
                <span className="text-sm font-medium text-secondary w-[80px]">{formatBytes(row.fileSizeBytes)}</span>
            )
        },
        {
            key: 'actions',
            header: '',
            render: (row: InstalledModDto) => (
                <div className="flex items-center justify-end gap-2 flex-1 min-w-[150px]">
                    <Switch checked={row.isEnabled} onChange={() => handleToggle(row.fileName)} />
                    <div className="w-px h-6 bg-border mx-1" />
                    {row.projectId && (
                        <button 
                            onClick={() => {
                                const url = row.source === 'CurseForge'
                                    ? `https://www.curseforge.com/minecraft/mc-mods/${row.projectId}`
                                    : `https://modrinth.com/mod/${row.projectId}`;
                                invoke('OPEN_URL', url);
                            }}
                            className="p-2 text-secondary hover:text-primary transition-colors outline-none" 
                            title={t('dashboard.viewOnSource', 'View source')}
                        >
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                    <button onClick={() => handleDelete(row.fileName)} className="p-2 text-secondary hover:text-red-400 transition-colors outline-none" title={t('common.delete', 'Delete')}>
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )
        }
    ];

    if (mods.length === 0) {
        return (
            <div className="flex-1 bg-surface/10 border border-border rounded-2xl p-8 flex items-center justify-center text-secondary">
                {t('dashboard.noModsInstalled', 'No mods installed yet.')}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <DataTable
                columns={columns}
                data={paginated}
                keyExtractor={(row) => row.fileName}
            />
            {filtered.length > pageSize && (
                <div className="flex items-center justify-center gap-1 mt-4">
                    <button 
                        disabled={page === 1}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-border hover:border-secondary disabled:opacity-50 text-secondary hover:text-primary transition-colors"
                    >
                        {'<'}
                    </button>
                    {Array.from({ length: Math.ceil(filtered.length / pageSize) }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setPage(i + 1)}
                            className={cn(
                                "w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold transition-colors",
                                page === i + 1 
                                    ? "bg-accent/20 text-accent border border-accent/20" 
                                    : "bg-surface border border-border hover:border-secondary text-secondary hover:text-primary"
                            )}
                        >
                            {i + 1}
                        </button>
                    ))}
                    <button 
                        disabled={page >= Math.ceil(filtered.length / pageSize)}
                        onClick={() => setPage(p => p + 1)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-surface border border-border hover:border-secondary disabled:opacity-50 text-secondary hover:text-primary transition-colors"
                    >
                        {'>'}
                    </button>
                </div>
            )}
        </div>
    );
}
