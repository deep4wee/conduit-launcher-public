import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Download, Tag } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { formatNumber } from '@/shared/lib/formatters';
import { DataTable, Column } from '@/shared/ui/Table';
import { ModVersion } from '@/shared/api/types/modrinth';
import { getTagBadgeStyle } from '@/shared/lib/utils';
            


interface VersionTableProps {
    versions: ModVersion[];
    onDownload: (version: ModVersion) => void;
    onRowClick: (version: ModVersion) => void;
    onGameVersionClick: (gv: string) => void;
    onPlatformClick: (platform: string) => void;
}

export function VersionTable({ versions, onDownload, onRowClick, onGameVersionClick, onPlatformClick }: VersionTableProps) {
    const [visibleCount, setVisibleCount] = useState(20);    
    const { t, i18n } = useTranslation();

    const getRelativeTime = (dateString: string) => {
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        const rtf = new Intl.RelativeTimeFormat(i18n.language, { numeric: 'auto' });

        const days = Math.floor(diffInSeconds / 86400);
        if (days > 30) return rtf.format(-Math.floor(days / 30), 'month');
        if (days > 0) return rtf.format(-days, 'day');
        const hours = Math.floor(diffInSeconds / 3600);
        if (hours > 0) return rtf.format(-hours, 'hour');
        return rtf.format(-Math.floor(diffInSeconds / 60), 'minute');
    };

    const columns: Column<ModVersion>[] = [
        {
            header: t('mod_details.name'),
            className: "flex-[4] flex items-center gap-4 min-w-0",
            render: (v) => (
                <>
                                        <span className={cn(
                        "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shrink-0 w-fit min-w-[64px] text-center whitespace-nowrap",
                        v.version_type === 'release' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
            
                            v.version_type === 'beta' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                                "bg-red-500/10 text-red-500 border border-red-500/20"
                    )}>
                        {v.version_type}
                    </span>
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-primary text-sm truncate">{v.name}</span>
                        <span className="text-xs text-secondary truncate font-mono mt-0.5">{v.version_number}</span>
                    </div>
                </>
            )
        },
        {
            header: t('mod_details.game_version'),
            className: "flex-[2] flex flex-wrap gap-1",
            render: (v) => (
                <>
                                        {v.game_versions.slice(0, 2).map(gv => (
                        <button 
                            key={gv} 
                            onClick={(e) => { e.stopPropagation(); onGameVersionClick(gv); }}
                            className="px-2 py-0.5 rounded-md bg-surface border border-border text-xs font-medium text-secondary hover:text-primary hover:border-secondary transition-colors outline-none cursor-pointer"
                        >
                            {gv}
                        </button>
                    ))}
                    {v.game_versions.length > 2 && <span className="px-2 py-0.5 rounded-md bg-surface border border-border text-xs font-medium text-secondary cursor-default">+{v.game_versions.length - 2}</span>}
                </>
            )
        },
        {
            header: t('mod_details.platform'),
            className: "flex-[2] flex flex-wrap gap-1",
            render: (v) => (
                <>
                    {v.loaders.map(l => (
                        <button 
                            key={l} 
                            onClick={(e) => { e.stopPropagation(); onPlatformClick(l); }}
                            className={cn("px-2 py-0.5 rounded-md border text-xs font-bold capitalize flex items-center gap-1 hover:brightness-125 transition-all outline-none cursor-pointer", getTagBadgeStyle(l))}
                        >
                            <Tag className="w-3 h-3 opacity-50" /> {l}
                        </button>
                    ))}
                </>
            )
            
        },
        {
            header: t('mod_details.published'),
            className: "flex-[2] text-sm text-secondary font-medium",
            render: (v) => getRelativeTime(v.date_published)
        },
        {
            header: <div className="text-right w-full">{t('mod_details.downloads')}</div>,
            className: "flex-[1.5] flex items-center justify-between md:justify-end gap-6 w-full",
            render: (v) => (
                <>
                    <span className="text-sm font-medium text-secondary md:hidden lg:block">{formatNumber(v.downloads)}</span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDownload(v); }}
                        className="w-10 h-10 rounded-xl bg-surface border border-border text-secondary hover:text-primary hover:border-secondary flex items-center justify-center transition-colors outline-none shrink-0"
                        title={t('mod_details.download_file')}
                    >
                        <Download className="w-5 h-5" />
                    </button>
                </>
            )
        }
    ];

    return (
        <div className="flex flex-col gap-4">
            <DataTable 
                data={versions.slice(0, visibleCount)} 
                columns={columns} 
                keyExtractor={(v) => v.id} 
                onRowClick={onRowClick}
                emptyMessage={t('mod_details.empty_versions')} 
            />
            {visibleCount < versions.length && (
                <button onClick={() => setVisibleCount(v => v + 20)} className="w-full py-3 bg-surface border border-border rounded-xl text-primary font-bold hover:bg-surfaceHover transition-colors">{t('common.load_more', 'Load More')}</button>
            )}
        </div>
    );
}
