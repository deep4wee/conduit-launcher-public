import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, LayoutList, ChevronLeft, ChevronRight, ChevronDown, Layers, X as XIcon, Search } from 'lucide-react';
            
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';

import { Dropdown } from '@/shared/ui/Dropdown';
import { useBrowserStore, useBrowserSearch } from '@/features/mod-search';
import { ModFilterSidebar } from '@/widgets/mod-filters';
import { useInstanceStore } from '@/entities/instance';
            
import { ModCard } from '@/entities/mod';
import { usePrefsStore } from '@/entities/prefs';
import { motion } from 'framer-motion';

export function BrowserPage() {
    const { openExternalUrl } = usePrefsStore();
    const { t } = useTranslation();
    
    const store = useBrowserStore();
    const { query, setQuery, searchInputRef } = useBrowserSearch();
    const [searchParams, setSearchParams] = useSearchParams();
    const { fetchInstances } = useInstanceStore();
    
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const instanceId = searchParams.get('instanceId');
        if (instanceId) {
            fetchInstances().then(() => {
                const currentInstances = useInstanceStore.getState().instances;
                const found = currentInstances.find(i => i.id === instanceId);
                if (found) {
                    store.setTargetInstance(found);
                }
            });
        }
    }, [searchParams, fetchInstances]);

    const currentPage = Math.floor(store.offset / store.limit) + 1;
    const totalPages = Math.max(1, Math.ceil(store.totalHits / store.limit));

    useEffect(() => {
        if (!store.hasLoadedOnce) {
            store.performSearch();
        }
    }, [store.hasLoadedOnce]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [store.offset, store.query, store.projectType]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex relative overflow-hidden bg-background"
        >
            <ModFilterSidebar isOpen={store.isSidebarOpen} onClose={() => store.setSidebarOpen(false)} />

            <div className="flex-1 flex flex-col p-6 overflow-hidden relative min-w-0">
            
            
                <div className="flex flex-col gap-4 mb-6 shrink-0 z-10">
                    <div className="flex gap-4 items-center">
                        <button
                            onClick={() => store.setSidebarOpen(!store.isSidebarOpen)}
                            className="p-3 bg-surface border border-border hover:border-secondary rounded-xl text-secondary hover:text-primary transition-colors outline-none shrink-0 shadow-sm"
                        >
                            {store.isSidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                        </button>
            
                        <div className="relative flex-1 min-w-0">
                            {/* Використовуємо Lucide іконку <search /> замість HTML тегу <search> */}
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary w-5 h-5 pointer-events-none" />
                            <input
                                ref={searchInputRef}
            
                                type="text"
                                placeholder={t('browser.search')}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-surface border border-border rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-accent transition-colors shadow-sm outline-none font-medium"
                            />
                        </div>
            
                    </div>

                    {store.targetInstance && (
                        <div className="flex items-center justify-between bg-accent/10 border border-accent/30 rounded-xl px-4 py-2.5 text-xs text-primary shadow-sm animate-in fade-in duration-200">
                            <div className="flex items-center gap-2.5 truncate">
                                <Layers className="w-4 h-4 text-accent shrink-0" />
                                <span className="text-secondary font-medium">{t('browser.filtering_for', 'Filtering for:')}</span>
                                <span className="font-bold text-accent truncate">{store.targetInstance.name}</span>
                                <span className="bg-accent/20 text-accent font-semibold px-2 py-0.5 rounded-md text-[10px]">
                                    {store.targetInstance.minecraftVersion} • {store.targetInstance.loaderType}
                                </span>
                            </div>
                            <button
                                onClick={() => {
                                    store.clearTargetInstance();
                                    if (searchParams.has('instanceId')) {
                                        searchParams.delete('instanceId');
                                        setSearchParams(searchParams);
                                    }
                                }}
                                className="flex items-center gap-1 text-secondary hover:text-primary transition-colors ml-4 shrink-0 font-medium cursor-pointer"
                                title={t('browser.clear_instance_filter', 'Clear instance filter')}
                            >
                                <XIcon className="w-4 h-4" />
                                <span>{t('common.clear', 'Clear')}</span>
                            </button>
                        </div>
                    )}

                    <div className="flex justify-between items-center bg-surface border border-border rounded-xl p-2 px-4 shadow-sm relative z-20">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-secondary shrink-0">{t('browser.sort_by')}</span>
                            
                            <Dropdown 
                                align="left"
                                trigger={
                                    <button className="bg-transparent text-sm font-bold text-primary focus:outline-none flex items-center gap-1 cursor-pointer outline-none whitespace-nowrap">
                                        {t(`browser.sort_${store.sort}`)}
                                        <ChevronDown className="w-4 h-4 text-primary" />
                                    </button>
                                }
                            >
                                {['relevance', 'downloads', 'newest', 'updated'].map(s => (
                                    <button 
                                        key={s} 
                                        onClick={() => store.setSearchParam('sort', s)} 
                                        className={cn("text-left px-3 py-2 rounded-lg text-sm transition-colors outline-none", store.sort === s ? "bg-accent/10 text-accent font-medium" : "text-primary hover:bg-surfaceHover")}
                                    >
                                        {t(`browser.sort_${s}`)}
                                    </button>
                                ))}
                            </Dropdown>
                        </div>

                        <div className="flex items-center gap-4 z-10">
                            {/* Випадаючий список вибору кількості елементів */}
                            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1 shadow-inner">
                                <Dropdown 
                                    align="right"
                                    trigger={
                                        <button className="text-xs font-bold text-primary flex items-center gap-1 outline-none">
                                            {store.limit}
                                            <ChevronDown className="w-3 h-3 text-secondary" />
                                        </button>
                                    }
                                >
                                    <div className="flex flex-col p-1 w-20">
                                        {[20, 30, 40].map(lim => (
                                            <button 
                                                key={lim} 
                                                onClick={() => store.setSearchParam('limit', lim)} 
                                                className={cn("px-2.5 py-1 text-xs font-bold rounded text-left transition-colors", store.limit === lim ? "bg-accent/10 text-accent" : "hover:bg-surfaceHover text-primary")}
                                            >
                                                {lim}
                                            </button>
                                        ))}
                                    </div>
                                </Dropdown>
                            </div>

                            {/* Лічильник елементів */}
                            <span className="text-xs text-secondary font-medium hidden sm:block">
                                {store.totalHits > 0 ? `${(store.offset + 1)} - ${Math.min(store.offset + store.limit, store.totalHits)} of ${store.totalHits}` : ''}
                            </span>

                            {/* Кнопки пагінації у верхньому барі */}
                            <div className="flex items-center gap-1">
                                <button 
                                    disabled={currentPage === 1} 
                                    onClick={() => store.setSearchParam('offset', Math.max(0, store.offset - store.limit))}
                                    className="p-1 rounded-md bg-background border border-border hover:border-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-primary outline-none shadow-sm"
                                    title="Попередня сторінка"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button 
                                    disabled={currentPage >= totalPages} 
                                    onClick={() => store.setSearchParam('offset', store.offset + store.limit)}
                                    className="p-1 rounded-md bg-background border border-border hover:border-secondary disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-primary outline-none shadow-sm"
                                    title="Наступна сторінка"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Режими перегляду (Сітка / Список) */}
                            <div className="flex items-center bg-background border border-border rounded-lg p-0.5 shrink-0">
                                <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-colors outline-none", viewMode === 'list' ? "bg-surface text-primary shadow-sm" : "text-secondary hover:text-primary")}><LayoutList className="w-4 h-4" /></button>
                                <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-colors outline-none", viewMode === 'grid' ? "bg-surface text-primary shadow-sm" : "text-secondary hover:text-primary")}><LayoutGrid className="w-4 h-4" /></button>
                            </div>
                        </div>
                    </div>
            
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-6 custom-scrollbar" ref={scrollRef}>
                    <div className={cn(
                        "gap-4", 
                        viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5" : "flex flex-col"
                    )}>
                                                {store.activePlatform === 'curseforge' ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-32 text-secondary">
                                <div className="w-20 h-20 bg-surface border border-border rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                                    <span className="text-4xl">🚧</span>
                                </div>
                                <h3 className="text-2xl font-bold text-primary mb-2">CurseForge Integration WIP</h3>
                                <p className="text-center max-w-md">
                                                                        CurseForge provider is planned for a future update. <br/><br/>
                                    <span className="font-mono text-xs bg-surface px-2 py-1 rounded border border-border">Expected: IModProvider -&gt; CurseForgeProvider</span>
                                </p>
                            </div>
            
                        ) : store.isSearching ? (
                            Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="bg-surface border border-border rounded-2xl p-4 flex gap-4 animate-pulse h-32">
                                    <div className="bg-background rounded-xl shrink-0 w-24 h-24"></div>
                                    <div className="flex-1 flex flex-col gap-2 pt-1 w-full">
                                        <div className="w-3/4 h-5 bg-background rounded"></div>
                                        <div className="w-1/2 h-4 bg-background rounded"></div>
                                        <div className="w-full h-8 mt-auto bg-background rounded-xl"></div>
                                    </div>
                                </div>
                            ))
                        ) : store.results.length > 0 ? (
                            store.results.map((mod) => (
                                <ModCard key={mod.project_id} mod={mod} viewMode={viewMode} onExternalLinkClick={openExternalUrl} />
                            ))
                                                ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-32 text-secondary opacity-50">
                                <div className="w-16 h-16 bg-surface rounded-full flex items-center justify-center mb-6 border border-border">
                                    <Search className="w-8 h-8" />
                                </div>
                                <p className="text-lg font-medium text-center">{t('browser.empty_state')}</p>
                            </div>
                        )}
            
            
                    </div>
                </div>
            </div>
        </motion.div>
    );
}