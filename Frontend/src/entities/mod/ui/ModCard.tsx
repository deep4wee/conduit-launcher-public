import { useNavigate } from 'react-router-dom';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn, getTagBadgeStyle } from '@/shared/lib/utils';

export function ModCard({ mod, viewMode, onExternalLinkClick }: { mod: any, viewMode: 'grid' | 'list', onExternalLinkClick?: (url: string) => void }) {
            
    const { t } = useTranslation();
    const navigate = useNavigate();
            

    const formatDownloads = (num: number) => {
            
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const handleAuthorClick = (e: React.MouseEvent, author: string) => {
        e.stopPropagation();
        if (onExternalLinkClick) onExternalLinkClick(`https://modrinth.com/user/${author}`);
    };

        return (
        <div 
            onClick={() => navigate(`/browser/mod/${mod.project_id}`)}
            onContextMenu={(e) => {
                e.preventDefault();
                if (onExternalLinkClick) onExternalLinkClick(`https://modrinth.com/mod/${mod.slug || mod.project_id}`);
            }}
            title="Right click to open in browser"
            className={cn(
                "bg-surface border border-border hover:border-secondary transition-all duration-300 rounded-2xl p-4 group shadow-sm hover:shadow-xl cursor-pointer flex min-w-0", 
                // Адаптивність: На малих екранах завжди колонка, на великих залежить від viewMode
                viewMode === 'list' ? "flex-col md:flex-row gap-5" : "flex-col gap-4 h-full"
            )}
        >
            
                        <div className={cn("bg-transparent rounded-xl shrink-0 overflow-hidden flex items-center justify-center", 
                viewMode === 'list' ? "w-full md:w-24 h-32 md:h-24" : "w-full h-40")}>
                {mod.icon_url ? (
                    <img src={mod.icon_url} alt={mod.title} className={cn("object-cover rounded-2xl shadow-md", viewMode === 'list' ? "w-20 h-20 md:w-full md:h-full" : "w-24 h-24")} />
                ) : (
                    <div className="text-4xl text-secondary">📦</div>
                )}
            </div>
            
            
            <div className="flex-1 min-w-0 flex flex-col h-full">
                <div className={cn("flex justify-between items-start gap-4 h-full", 
                    viewMode === 'list' ? "flex-col lg:flex-row" : "flex-col"
                )}>
                    <div className="flex flex-col min-w-0 flex-1 w-full">
                        <h3 className="font-bold text-primary truncate text-xl leading-tight group-hover:text-accent transition-colors">{mod.title}</h3>
                        <span className="text-sm text-secondary truncate mt-1">
                            by <span className="text-primary font-medium hover:text-accent transition-colors cursor-pointer" onClick={(e) => handleAuthorClick(e, mod.author)}>{mod.author}</span>
                        </span>
                        
                                                <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-2 py-0.5 rounded-md border text-[10px] font-bold text-secondary capitalize bg-surface border-border">
                                {mod.project_type.replace('project_type:', '')}
                            </span>
                            {mod.display_categories?.slice(0, 3).map((cat: string) => (
                                <span key={cat} className={cn("px-2 py-0.5 rounded-md border text-[10px] font-bold capitalize", getTagBadgeStyle(cat))}>
                                    {cat}
                                </span>
                            ))}
                        </div>
            
                        <p className="text-sm text-secondary line-clamp-2 mt-3 leading-relaxed">{mod.description}</p>
                    </div>
                    
                                        {/* Кнопка завжди притискається до низу завдяки mt-auto */}
                    <div className={cn("flex flex-col shrink-0 gap-3 mt-auto pt-4", 
                        viewMode === 'list' ? "w-full lg:w-auto lg:items-end" : "w-full"
                    )}>
                        <button 
                            className="w-full lg:w-auto text-[#11111b] bg-accent hover:opacity-90 px-4 py-2.5 rounded-xl transition-colors outline-none font-bold text-sm flex items-center justify-center gap-2 shadow-sm" 
                            onClick={(e) => { 
                                e.stopPropagation(); 
                                navigate(`/browser/mod/${mod.project_id}#versions`); 
                            }}
                        >
                            <Download className="w-4 h-4" /> {t('browser.download')}
                        </button>
                        <div className="flex justify-between lg:flex-col lg:items-end text-xs text-secondary gap-1 mt-1 w-full">
            
                            <span className="flex items-center gap-1.5"><Download className="w-3.5 h-3.5" /> {formatDownloads(mod.downloads)}</span>
                            {mod.date_modified && <span className="flex items-center gap-1.5">🕒 {formatDate(mod.date_modified)}</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
    