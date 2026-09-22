import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, X, ArrowLeftRight } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
            
import { modApi } from '@/entities/mod';
import { useBrowserStore } from '@/features/mod-search';

const PROJECT_TYPES = [
            
    { id: 'project_type:mod', labelKey: 'browser.categories.project_type:mod' },
    { id: 'project_type:modpack', labelKey: 'browser.categories.project_type:modpack' },
    { id: 'project_type:resourcepack', labelKey: 'browser.categories.project_type:resourcepack' },
    { id: 'project_type:shader', labelKey: 'browser.categories.project_type:shader' }
];

export function ModFilterSidebar({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
   
    const { t } = useTranslation();
    const { activePlatform, setActivePlatform, projectType, selectedLoader, selectedVersion, environment, selectedCategories, setSearchParam, targetInstance } = useBrowserStore();
    
    const [loaders, setLoaders] = useState<string[]>([]);
    const [versions, setVersions] = useState<string[]>([]);
    const [loaderSearchQuery, setLoaderSearchQuery] = useState('');
    const [allCategories, setAllCategories] = useState<string[]>([]);
    
    const [isVersionDropdownOpen, setIsVersionDropdownOpen] = useState(false);
    const [versionSearchQuery, setVersionSearchQuery] = useState('');
    const filteredVersions = versions.filter(v => v.toLowerCase().includes(versionSearchQuery.toLowerCase()));

    useEffect(() => {
        modApi.getTags('game_version').then(data => {
            if (data) setVersions(data.filter(v => v.version_type === 'release').map(v => v.version));
        }).catch(console.error);

        modApi.getTags('loader').then(data => {
            if (data) {
                const names = data.map((l: any) => l.name);
                const popular = ['fabric', 'forge', 'neoforge', 'quilt'];
                const serverCores = ['bukkit', 'spigot', 'paper', 'purpur', 'bungeecord', 'velocity', 'waterfall', 'sponge', 'folia'];
                
                const sorted = names.sort((a: string, b: string) => {
                    const aPop = popular.includes(a);
                    const bPop = popular.includes(b);
                    if (aPop && !bPop) return -1;
                    if (!aPop && bPop) return 1;
                    
                    const aSrv = serverCores.includes(a);
                    const bSrv = serverCores.includes(b);
                    if (aSrv && !bSrv) return 1;
                    if (!aSrv && bSrv) return -1;

                    return a.localeCompare(b);
                });
                
                setLoaders(sorted);
            }
        }).catch(console.error);

        modApi.getTags('category').then(data => {
            if (data) {
                const currentType = projectType.replace('project_type:', '');
                const cats = data.filter((c: any) => c.project_type === currentType).map((c: any) => c.name);
                setAllCategories(cats);
            }
        }).catch(console.error);
    }, [projectType]);

    const toggleCategory = (cat: string) => {
        if (selectedCategories.includes(cat)) {
            setSearchParam('selectedCategories', selectedCategories.filter(c => c !== cat));
        } else {
            setSearchParam('selectedCategories', [...selectedCategories, cat]);
        }
    };

    return (
        <>
            {isOpen && (
                <div 
                    className="absolute inset-0 bg-black/50 z-30 transition-opacity backdrop-blur-sm" 
                    onClick={onClose}
                />
            )}

            <div className={cn(
                "absolute left-0 top-0 bottom-0 bg-background border-r border-border flex flex-col transition-transform duration-300 ease-in-out shrink-0 overflow-y-auto [&::-webkit-scrollbar]:hidden z-40 shadow-2xl w-80",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                                {/* Sticky Header з індикатором перемикання платформи */}
                <div className="sticky top-0 bg-background z-10 pt-6 pb-4 px-6 shadow-[0_10px_10px_-10px_rgba(0,0,0,0.2)] flex justify-between items-center group cursor-pointer" onClick={() => setActivePlatform(activePlatform === 'modrinth' ? 'curseforge' : 'modrinth')}>
                    <div className="flex items-center gap-3">
                        <div className="relative h-10 w-44 overflow-hidden">
                            <div className={cn(
                                "absolute inset-0 flex items-center transition-transform duration-500 ease-out",
                                activePlatform === 'modrinth' ? "translate-y-0" : "-translate-y-full"
                            )}>
                                <h2 className="text-[2.3rem] leading-none font-black text-[#1bd96a] tracking-tighter lowercase drop-shadow-sm">modrinth</h2>
                            </div>
                            <div className={cn(
                                "absolute inset-0 flex items-center transition-transform duration-500 ease-out",
                                activePlatform === 'curseforge' ? "translate-y-0" : "translate-y-full"
                            )}>
                                <h2 className="text-[2rem] leading-none font-black text-[#f16436] tracking-tighter drop-shadow-sm">CurseForge</h2>
                            </div>
                        </div>
                        
                        {/* Бейдж перемикача */}
                        <div className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md bg-surface border border-border text-secondary group-hover:border-accent group-hover:text-accent transition-colors">
                            <ArrowLeftRight className="w-3 h-3" />
                        </div>
                    </div>
                    
                    <button onClick={(e) => { e.stopPropagation(); onClose(); }} className="p-2 text-secondary hover:text-primary hover:bg-surface rounded-xl transition-colors outline-none z-20">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            
                
                <div className="p-6 pt-2 flex flex-col">
                    
                    {/* Project Types */}
                    <div className="bg-surface rounded-xl p-4 border border-border mb-4 shadow-sm">
                        <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">{t('browser.browse_by')}</h3>
                        <div className="flex flex-col gap-2">
                            {PROJECT_TYPES.filter(type => {
                                if (environment === 'server' && (type.id === 'project_type:shader' || type.id === 'project_type:resourcepack')) {
                                    return false;
                                }
                                if (targetInstance && type.id === 'project_type:modpack') {
                                    return false;
                                }
                                if (targetInstance && (targetInstance.loaderType.toLowerCase() === 'vanilla' || targetInstance.loaderType === '') && type.id === 'project_type:mod') {
                                    return false;
                                }
                                return true;
                            }).map((type) => (
                                <label key={type.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => { setSearchParam('projectType', type.id); setSearchParam('selectedCategories', []); }}>
                                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors", projectType === type.id ? "border-accent" : "border-secondary group-hover:border-primary")}>
                                        {projectType === type.id && <div className="w-2 h-2 bg-accent rounded-full" />}
                                    </div>
                                    <span className={cn("text-sm transition-colors", projectType === type.id ? "text-primary font-medium" : "text-secondary group-hover:text-primary")}>
                                        {t(type.labelKey)}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Environment (Client/Server) */}
                    <div className="bg-surface rounded-xl p-4 border border-border mb-4 shadow-sm">
                        <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">{t('browser.environment')}</h3>
                        <div className="flex bg-background border border-border rounded-lg p-1">
                            {(['', 'client', 'server']).map(env => (
                                <button
                                    key={env}
                                    onClick={() => {
                                        setSearchParam('environment', env);
                                        if (env === 'server' && (projectType === 'project_type:shader' || projectType === 'project_type:resourcepack')) {
                                            setSearchParam('projectType', 'project_type:mod');
                                        }
                                    }}
                                    className={cn("flex-1 py-1.5 text-xs font-bold rounded-md transition-colors outline-none capitalize", environment === env ? "bg-surface text-primary shadow-sm" : "text-secondary hover:text-primary")}
                                >
                                    {env === '' ? t('browser.env_all') : t(`browser.env_${env}`)}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Mod Loaders */}
                    {(projectType === 'project_type:mod' || projectType === 'project_type:modpack') && (
                        <div className="bg-surface rounded-xl p-4 border border-border mb-4 shadow-sm flex flex-col">
                            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3 shrink-0">{t('browser.mod_loaders')}</h3>
                            <div className="px-1 mb-2 shrink-0">
                                <input 
                                    type="text" 
                                    placeholder={t('browser.search')} 
                                    value={loaderSearchQuery} 
                                    onChange={(e) => setLoaderSearchQuery(e.target.value)} 
                                    className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-accent text-primary transition-colors" 
                                />
                            </div>
                            <div className="flex flex-col gap-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                                {loaders.filter(l => l.toLowerCase().includes(loaderSearchQuery.toLowerCase())).map((l, index, arr) => {
                                    const isSelected = selectedLoader === l;
                                    const isServerCore = ['bukkit', 'spigot', 'paper', 'purpur', 'bungeecord', 'velocity', 'waterfall', 'sponge', 'folia'].includes(l);
                                    const prevIsServerCore = index > 0 && ['bukkit', 'spigot', 'paper', 'purpur', 'bungeecord', 'velocity', 'waterfall', 'sponge', 'folia'].includes(arr[index - 1]);
                                    const showServerHeader = isServerCore && !prevIsServerCore;
                                    
                                    return (
                                        <div key={l}>
                                            {showServerHeader && (
                                                <div className="text-[10px] font-bold text-secondary uppercase tracking-wider mt-3 mb-1 px-1">{t('browser.server_plugins', 'Server Plugins / Cores')}</div>
                                            )}
                                            <button 
                                                onClick={() => setSearchParam('selectedLoader', isSelected ? '' : l)}
                                                className={cn(
                                                    "w-full px-3 py-2 rounded-lg text-sm font-bold transition-colors outline-none capitalize text-left flex items-center gap-2", 
                                                    isSelected 
                                                        ? "bg-accent/20 text-accent border border-accent/20" 
                                                        : "text-secondary hover:bg-surfaceHover hover:text-primary border border-transparent"
                                                )}
                                            >
                                                <div className={cn("w-2 h-2 rounded-full", isSelected ? "bg-accent" : "bg-border group-hover:bg-secondary")} />
                                                {l}
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Game Versions */}
                    <div className="bg-surface rounded-xl p-4 border border-border mb-4 shadow-sm">
                        <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">{t('browser.game_version')}</h3>
                        <div className="relative">
                            <button onClick={() => setIsVersionDropdownOpen(!isVersionDropdownOpen)} className="w-full bg-background border border-border hover:border-secondary transition-colors rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-accent outline-none flex justify-between items-center font-medium">
                                {selectedVersion === '' ? t('browser.env_all') : selectedVersion}
                                <ChevronDown className="w-4 h-4 text-secondary" />
                            </button>
                            {isVersionDropdownOpen && (
                                <>
                                    <div className="fixed inset-0 z-50" onClick={() => setIsVersionDropdownOpen(false)}></div>
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl shadow-xl z-[60] overflow-hidden flex flex-col">
                                        <div className="p-2 border-b border-border">
                                            <input type="text" placeholder={t('browser.search_version')} value={versionSearchQuery} onChange={(e) => setVersionSearchQuery(e.target.value)} className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent text-primary" />
                                        </div>
                                        <div className="max-h-48 overflow-y-auto p-1 flex flex-col gap-0.5 custom-scrollbar">
                                            <button onClick={() => { setSearchParam('selectedVersion', ''); setIsVersionDropdownOpen(false); setVersionSearchQuery(''); }} className="text-left px-3 py-2 rounded-lg text-sm transition-colors outline-none text-secondary font-bold hover:bg-surfaceHover">
                                                {t('browser.env_all')}
                                            </button>
                                            {filteredVersions.map(v => (
                                                <button key={v} onClick={() => { setSearchParam('selectedVersion', v); setIsVersionDropdownOpen(false); setVersionSearchQuery(''); }} className={cn("text-left px-3 py-2 rounded-lg text-sm transition-colors outline-none", selectedVersion === v ? "bg-accent/10 text-accent font-medium" : "text-primary hover:bg-surfaceHover")}>
                                                    {v}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Categories (Tags) */}
                    {allCategories.length > 0 && (
                        <div className="bg-surface rounded-xl p-4 border border-border shadow-sm">
                            <h3 className="text-sm font-bold text-secondary uppercase tracking-wider mb-3">{t('browser.categories_title')}</h3>
                            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                                {allCategories.map((cat) => (
                                    <label key={cat} className="flex items-center gap-3 cursor-pointer group" onClick={() => toggleCategory(cat)}>
                                        <div className={cn("w-4 h-4 rounded-[4px] border-2 flex items-center justify-center transition-colors shrink-0", selectedCategories.includes(cat) ? "border-accent bg-accent" : "border-secondary group-hover:border-primary")}>
                                            {selectedCategories.includes(cat) && <div className="w-2 h-2 bg-[#11111b] rounded-[1px]" />}
                                        </div>
                                        <span className={cn("text-sm capitalize transition-colors truncate", selectedCategories.includes(cat) ? "text-primary font-medium" : "text-secondary group-hover:text-primary")}>
                                            {t(`browser.mod_categories.${cat}`, { defaultValue: cat.replace('-', ' ') })}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}