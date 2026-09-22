import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft, Download, Heart, ChevronDown, Filter } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { formatNumber, formatDate } from '@/shared/lib/formatters';
import { Button } from '@/shared/ui/Button';
import { Dropdown } from '@/shared/ui/Dropdown';
import { ModDetails, ModVersion, TeamMember, DependencyProject } from '@/shared/api/types/modrinth';
import { MarkdownViewer } from '@/shared/ui/MarkdownViewer/MarkdownViewer';
import { modApi, ModGallery, VersionTable } from '@/entities/mod';
import { ModInfoSidebar } from '@/widgets/mod-info';
import { InstallModModal, InstallModpackModal } from '@/features/mod-install';
import { useBrowserStore } from '@/features/mod-search';

import { useRef } from 'react';
import { motion } from 'framer-motion';

export function ModDetailsPage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    
    const scrollRef = useRef<HTMLDivElement>(null);
    
    const [project, setProject] = useState<ModDetails | null>(null);
    const [team, setTeam] = useState<TeamMember[]>([]);
    const [dependencies, setDependencies] = useState<DependencyProject[]>([]);
    
    const [loading, setLoading] = useState(true);
    const [versions, setVersions] = useState<ModVersion[]>([]);
    
    const [loadingVersions, setLoadingVersions] = useState(false);
    const [activeTab, setActiveTab] = useState<'description' | 'gallery' | 'changelog' | 'versions'>('description');

    const { targetInstance } = useBrowserStore();
    // Стан фільтрів для таблиці версій
    const [versionGameFilter, setVersionGameFilter] = useState<string>(targetInstance?.minecraftVersion || 'All');
    const [versionPlatformFilter, setVersionPlatformFilter] = useState<string>(targetInstance?.loaderType || 'All');
    const uniqueGameVersions = Array.from(new Set(versions.flatMap(v => v.game_versions))).sort((a, b) => {
        const pa = a.split('.').map(Number);
        const pb = b.split('.').map(Number);
        for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
            const na = pa[i] || 0; const nb = pb[i] || 0;
            if (na !== nb) return nb - na; // Descending
        }
        return 0;
    });
    const uniquePlatforms = Array.from(new Set(versions.flatMap(v => v.loaders))).sort();

    // Застосування фільтрів
    const filteredVersions = versions.filter(v => {
        const matchGame = versionGameFilter === 'All' || v.game_versions.includes(versionGameFilter);
        const matchPlatform = versionPlatformFilter === 'All' || v.loaders.some(l => l.toLowerCase() === versionPlatformFilter.toLowerCase());
        return matchGame && matchPlatform;
    });

    useEffect(() => {
        if (location.hash === '#versions') setActiveTab('versions');
    }, [location.hash]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [activeTab]);

        useEffect(() => {
        if (!id) return;
        setLoading(true);
        modApi.getProjectDetails(id)
            .then(data => setProject(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    useEffect(() => {
        if ((activeTab === 'versions' || activeTab === 'changelog') && versions.length === 0 && id) {
            setLoadingVersions(true);
            modApi.getProjectVersions({ projectId: id, gameVersion: '', loader: '' })
                .then(data => setVersions(data))
                .catch(console.error)
                .finally(() => setLoadingVersions(false));
        }
    }, [activeTab, id, versions.length]);

    // Завантаження команди (Авторів)
    useEffect(() => {
        if (id) {
            modApi.getProjectTeam(id)
                .then(data => setTeam(data))
                .catch(console.error);
        }
    }, [id]);

    // Завантаження залежностей на основі першої знайденої версії
    useEffect(() => {
        if (versions.length > 0) {
            const latest = versions[0];
            if (latest.dependencies && latest.dependencies.length > 0) {
                const projectIds = latest.dependencies.map(d => d.project_id).filter(Boolean);
                if (projectIds.length > 0) {
                    modApi.getProjectsBulk(projectIds as string[])
                        .then(data => setDependencies(data))
                        .catch(console.error);
                }
            }
        }
    }, [versions]);
            

    const [installModalData, setInstallModalData] = useState<{
        isOpen: boolean;
        version: ModVersion | null;
    }>({ isOpen: false, version: null });

    const [modpackModalData, setModpackModalData] = useState<{
        isOpen: boolean;
        fileUrl: string;
        modpackTitle: string;
    }>({ isOpen: false, fileUrl: '', modpackTitle: '' });

    const handleDownloadVersion = (e: React.MouseEvent, version: ModVersion) => {
        e.stopPropagation(); 
        if (project?.project_type === 'modpack') {
            const file = version.files.find(f => f.primary) || version.files[0];
            if (file) {
                setModpackModalData({
                    isOpen: true,
                    fileUrl: file.url,
                    modpackTitle: project.title
                });
            }
            return;
        }
        setInstallModalData({ isOpen: true, version });
    };

    const handleInstallLatest = () => {
        if (versions.length > 0) {
            const latest = versions[0];
            if (project?.project_type === 'modpack') {
                const file = latest.files.find(f => f.primary) || latest.files[0];
                if (file) {
                    setModpackModalData({
                        isOpen: true,
                        fileUrl: file.url,
                        modpackTitle: project.title
                    });
                }
                return;
            }
            setInstallModalData({ isOpen: true, version: latest });
        } else {
            setActiveTab('versions');
        }
    };

    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-background">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col bg-background overflow-hidden relative"
        >
            {/* Header */}
            <div className="px-6 py-6 flex flex-col md:flex-row md:items-center gap-6 border-b border-border bg-surface/30 shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-6 flex-1 min-w-0">
                    <button onClick={() => navigate(-1)} className="p-2.5 hover:bg-surfaceHover rounded-xl transition-colors outline-none text-secondary hover:text-primary shrink-0 bg-surface border border-border shadow-sm">
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <img 
                        src={project.icon_url || 'https://placehold.co/128x128/1e1e2e/cdd6f4?text=Mod'} 
                        alt={project.title} 
                        className="w-16 h-16 rounded-2xl border border-border/80 shadow-md object-cover shrink-0" 
                    />
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-2xl font-black tracking-tight text-primary truncate">{project.title}</h1>
                        <p className="text-sm text-secondary truncate mt-0.5 max-w-xl">{project.description}</p>
                    </div>
                </div>
                <div className="flex items-center md:flex-col md:items-end gap-4 shrink-0 w-full md:w-auto justify-between md:justify-center">
                    <div className="flex items-center gap-4 text-sm text-secondary font-medium">
                        <span className="flex items-center gap-1.5"><Download className="w-4 h-4" /> {formatNumber(project.downloads)}</span>
                        <span className="flex items-center gap-1.5"><Heart className="w-4 h-4" /> {formatNumber(project.followers)}</span>
                    </div>
                    <Button onClick={handleInstallLatest} className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-base shadow-lg shadow-accent/20 transition-transform active:scale-95">
                        <Download className="w-5 h-5" /> {t('mod_details.install')}
                    </Button>
                </div>
            </div>

                      
           <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row bg-background" ref={scrollRef}>
                {/* Main Content (Tabs) */}
                <div className="flex-1 flex flex-col min-w-0 max-w-full">
                    <div className="flex items-center gap-8 px-8 pt-4 border-b border-border bg-background/95 overflow-x-auto [&::-webkit-scrollbar]:hidden shrink-0 sticky top-0 z-10 backdrop-blur-md shadow-sm">
                        {(['description', 'gallery', 'changelog', 'versions'] as const).map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)} 
                                className="pb-4 text-sm font-bold transition-all outline-none border-b-[3px] whitespace-nowrap capitalize border-transparent text-secondary hover:text-primary"
                                style={activeTab === tab ? { borderColor: 'var(--color-accent)', color: 'var(--text-primary)' } : {}}
                            >
                                {t(`mod_details.tab_${tab}`)}
                            </button>
                        ))}
                    </div>
            
                        <div className="p-8 pb-32 min-w-0 max-w-full">
                        {/* DESCRIPTION */}
            
                        {activeTab === 'description' && (
                            <MarkdownViewer content={project.body} />
                        )}
                
                        {/* GALLERY */}
                        {activeTab === 'gallery' && (
                            <ModGallery gallery={project.gallery} />
                        )}

                        {/* CHANGELOG */}
                        {activeTab === 'changelog' && (
                            <div className="flex flex-col gap-8">
                                {loadingVersions ? (
                                    <div className="flex justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : versions.filter(v => v.changelog).length > 0 ? (
                                    versions.filter(v => v.changelog).slice(0, 10).map(v => (
                                        <div key={v.id} className="flex flex-col gap-3">
                                            <h3 className="text-xl font-bold text-primary flex items-center gap-3">
                                                {v.name}
                                                <span className="text-xs font-normal text-secondary bg-surface px-2 py-1 rounded-md">{formatDate(v.date_published)}</span>
                                            </h3>
                                            <MarkdownViewer content={v.changelog || t('mod_details.empty_changelog')} className="bg-surface/20 p-6 rounded-2xl border border-border prose-sm" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 text-secondary">{t('mod_details.empty_changelog')}</div>
                                )}
                            </div>
                        )}

                        {/* VERSIONS */}
                        {activeTab === 'versions' && (
                            <div className="flex flex-col gap-4">
                                {/* Filters Row */}
                                <div className="flex items-center gap-4 mb-2 z-20">
                                    <Dropdown 
                                        trigger={
                                            <button className="flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-border text-sm font-medium text-primary hover:border-secondary transition-colors outline-none shadow-sm">
                                                <Filter className="w-4 h-4" /> 
                                                {versionGameFilter === 'All' ? t('mod_details.filters.game_versions') : versionGameFilter} 
                                                <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                                            </button>
                                        }
                                    >
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col w-48 p-1">
                                            <button onClick={() => setVersionGameFilter('All')} className={cn("text-left px-3 py-2 rounded-lg text-sm transition-colors outline-none", versionGameFilter === 'All' ? "bg-accent/10 text-accent font-medium" : "text-primary hover:bg-surfaceHover")}>
                                                {t('browser.env_all')}
                                            </button>
                                            {uniqueGameVersions.map(gv => (
                                                <button key={gv} onClick={() => setVersionGameFilter(gv)} className={cn("text-left px-3 py-2 rounded-lg text-sm transition-colors outline-none", versionGameFilter === gv ? "bg-accent/10 text-accent font-medium" : "text-primary hover:bg-surfaceHover")}>
                                                    {gv}
                                                </button>
                                            ))}
                                        </div>
                                    </Dropdown>

                                    <Dropdown 
                                        trigger={
                                            <button className="flex items-center gap-2 bg-surface px-4 py-2 rounded-full border border-border text-sm font-medium text-primary hover:border-secondary transition-colors outline-none shadow-sm">
                                                <Filter className="w-4 h-4" /> 
                                                {versionPlatformFilter === 'All' ? t('mod_details.platform') : <span className="capitalize">{versionPlatformFilter}</span>} 
                                                <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
                                            </button>
                                        }
                                    >
                                        <div className="max-h-64 overflow-y-auto custom-scrollbar flex flex-col w-48 p-1">
                                            <button onClick={() => setVersionPlatformFilter('All')} className={cn("text-left px-3 py-2 rounded-lg text-sm transition-colors outline-none", versionPlatformFilter === 'All' ? "bg-accent/10 text-accent font-medium" : "text-primary hover:bg-surfaceHover")}>
                                                {t('browser.env_all')}
                                            </button>
                                            {uniquePlatforms.map(p => (
                                                <button key={p} onClick={() => setVersionPlatformFilter(p)} className={cn("text-left px-3 py-2 rounded-lg text-sm capitalize transition-colors outline-none", versionPlatformFilter === p ? "bg-accent/10 text-accent font-medium" : "text-primary hover:bg-surfaceHover")}>
                                                    {p}
                                                </button>
                                            ))}
                                        </div>
                                    </Dropdown>
                                </div>

                                                                {loadingVersions ? (
                                    <div className="flex justify-center py-20">
                                        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                ) : (
                                    <VersionTable 
                                        versions={filteredVersions} 
                                        onRowClick={(v) => navigate(`/browser/mod/${id}/version/${v.id}`)}
                                        onGameVersionClick={setVersionGameFilter}
                                        onPlatformClick={setVersionPlatformFilter}
                                        onDownload={(v) => handleDownloadVersion({ stopPropagation: () => {} } as React.MouseEvent, v)} 
                                    />
                                )}
                            </div>
                        )}
                    </div>
                </div>

                                {/* Right Sidebar (Metadata) */}
                <div className="w-full xl:w-[360px] shrink-0 border-t xl:border-t-0 xl:border-l border-border flex flex-col">
                    <ModInfoSidebar project={project} team={team} dependencies={dependencies} />
                </div>
            
            </div>

            {installModalData.isOpen && installModalData.version && (() => {
                const file = installModalData.version.files.find(f => f.primary) || installModalData.version.files[0];
                if (!file) return null;
                const isClient = project.client_side === 'required' || project.client_side === 'optional';
                const isServer = project.server_side === 'required' || project.server_side === 'optional';
                let env = 'Both';
                if (isClient && !isServer) env = 'Client';
                else if (isServer && !isClient) env = 'Server';

                return (
                    <InstallModModal
                        isOpen={installModalData.isOpen}
                        onClose={() => setInstallModalData({ isOpen: false, version: null })}
                        modTitle={project.title}
                        versionName={installModalData.version.name}
                        fileUrl={file.url}
                        fileName={file.filename}
                        projectId={project.id}
                        versionId={installModalData.version.id}
                        gameVersions={installModalData.version.game_versions}
                        loaders={installModalData.version.loaders}
                        environment={env}
                        source="Modrinth"
                    />
                );
            })()}

            {modpackModalData.isOpen && (
                <InstallModpackModal
                    isOpen={modpackModalData.isOpen}
                    onClose={() => setModpackModalData({ isOpen: false, fileUrl: '', modpackTitle: '' })}
                    modpackTitle={modpackModalData.modpackTitle}
                    fileUrl={modpackModalData.fileUrl}
                />
            )}
        </motion.div>
    );
}
            
            