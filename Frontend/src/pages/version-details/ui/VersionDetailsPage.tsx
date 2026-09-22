import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Download, FileBox, ShieldAlert, Tag } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { modApi } from '@/entities/mod';
import { usePrefsStore } from '@/entities/prefs';
import { cn, getTagBadgeStyle } from '@/shared/lib/utils';
import { formatNumber, formatDate } from '@/shared/lib/formatters';
import { MarkdownViewer } from '@/shared/ui/MarkdownViewer/MarkdownViewer';
import { ModVersion, DependencyProject } from '@/shared/api/types/modrinth';
import { InstallModModal } from '@/features/mod-install';
import { useRef } from 'react';
import { motion } from 'framer-motion';

export function VersionDetailsPage() {
    const { t } = useTranslation();
    const { id, versionId } = useParams<{ id: string, versionId: string }>();
    const navigate = useNavigate();
    const scrollRef = useRef<HTMLDivElement>(null);
    const { openExternalUrl } = usePrefsStore();


    const [version, setVersion] = useState<ModVersion | null>(null);
    const [dependencies, setDependencies] = useState<DependencyProject[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!versionId) return;
        setLoading(true);
        modApi.getVersionDetails(versionId)
            .then(data => {
                setVersion(data);
                if (data.dependencies && data.dependencies.length > 0) {
                    const projectIds = data.dependencies.map(d => d.project_id).filter(Boolean);
                    if (projectIds.length > 0) {
                        modApi.getProjectsBulk(projectIds as string[])
                            .then(depData => setDependencies(depData))
                            .catch(console.error);
                    }
                }
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [versionId]);

    const [selectedFileToInstall, setSelectedFileToInstall] = useState<any | null>(null);

    const handleDownload = (file: any) => {
        setSelectedFileToInstall(file);
    };


    if (loading) {
        return (
            <div className="h-full w-full flex items-center justify-center bg-background">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!version) return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-background text-secondary gap-4">
            <ShieldAlert className="w-12 h-12" />
            <h2 className="text-xl font-bold">Version not found</h2>
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-surface rounded-xl hover:text-primary">Go Back</button>
        </div>
    );

    return (
        <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col bg-background overflow-hidden relative"
        >
            {/* Header */}
            <div className="px-6 py-6 flex flex-col gap-4 border-b border-border bg-surface/30 shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-surfaceHover rounded-xl transition-colors outline-none text-secondary hover:text-primary shrink-0 border border-border shadow-sm bg-surface">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-2xl font-bold text-primary truncate flex items-center gap-3">
                            {version.name}
                            <span className={cn(
                                "text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest shrink-0 text-center",
                                version.version_type === 'release' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                    version.version_type === 'beta' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                                        "bg-red-500/10 text-red-500 border border-red-500/20"
                            )}>
                                {version.version_type}
                            </span>
                        </h1>
                        <span className="text-sm text-secondary font-mono mt-1">{version.version_number} • {formatDate(version.date_published)}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-bold text-secondary mr-2">{t('mod_details.filters.game_versions')}:</span>
                    {version.game_versions.map(gv => (
                        <span key={gv} className="px-2 py-1 rounded-md bg-surface border border-border text-xs font-bold text-primary">{gv}</span>
                    ))}
                    <div className="w-px h-4 bg-border mx-2" />
                    {version.loaders.map(l => (
                        <span key={l} className={cn("px-2 py-1 rounded-md border text-xs font-bold capitalize flex items-center gap-1", getTagBadgeStyle(l))}>
                            <Tag className="w-3 h-3 opacity-50" /> {l}
                        </span>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col xl:flex-row items-start bg-background" ref={scrollRef}>
                {/* Changelog */}
                <div className="w-full xl:w-2/3 p-8 flex flex-col gap-6 min-w-0 border-r border-border h-fit">
                    <h2 className="text-lg font-bold text-primary uppercase tracking-wider">{t('mod_details.tab_changelog')}</h2>

                    <MarkdownViewer content={version.changelog || t('mod_details.empty_changelog')} className="bg-surface/10 p-6 rounded-2xl border border-border prose-sm" />
                </div>

                {/* Files & Dependencies */}
                <div className="w-full xl:w-1/3 p-8 flex flex-col gap-8 bg-surface/5 min-w-[350px] h-fit">

                    <section>
                        <h2 className="text-lg font-bold text-primary uppercase tracking-wider mb-4 flex items-center gap-2"><FileBox className="w-5 h-5 text-secondary" /> Files</h2>
                        <div className="flex flex-col gap-3">
                            {version.files.map(file => (
                                <div key={file.url} className={cn("flex flex-col gap-3 p-4 rounded-xl border shadow-sm", file.primary ? "bg-accent/5 border-accent/30" : "bg-surface border-border")}>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex flex-col min-w-0">
                                            <span className="font-bold text-sm text-primary truncate">{file.filename}</span>
                                            <span className="text-xs text-secondary font-mono">{file.size ? formatNumber(file.size) + ' bytes' : 'Unknown size'}</span>
                                        </div>
                                        <button
                                            onClick={() => handleDownload(file)}
                                            className="w-10 h-10 rounded-xl bg-accent text-[#11111b] hover:opacity-90 flex items-center justify-center transition-all outline-none shrink-0 shadow-md"
                                            title={t('mod_details.download_file')}
                                        >
                                            <Download className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {dependencies.length > 0 && (
                        <section>
                            <h2 className="text-lg font-bold text-primary uppercase tracking-wider mb-4">{t('mod_details.dependencies')}</h2>
                            <div className="flex flex-col gap-3">
                                {dependencies.map(dep => {
                                    // Find dependency type from version array
                                    const depType = version.dependencies?.find(d => d.project_id === dep.id)?.dependency_type || 'required';

                                    return (
                                        <div
                                            key={dep.id}
                                            className="flex items-center gap-4 bg-surface p-3 rounded-xl border border-border shadow-sm group cursor-pointer hover:border-secondary transition-colors"
                                            onClick={() => navigate(`/browser/mod/${dep.id}`)}
                                            onContextMenu={(e) => {
                                                e.preventDefault();
                                                openExternalUrl(`https://modrinth.com/${dep.project_type.replace('project_type:', '')}/${dep.id}`);
                                            }}
                                            title={t('mod_details.link_action_hint')}
                                        >

                                            {dep.icon_url ? (
                                                <img src={dep.icon_url} alt={dep.title} className="w-12 h-12 rounded-xl bg-background shrink-0 shadow-sm object-cover" />
                                            ) : (
                                                <div className="w-12 h-12 rounded-xl bg-background shrink-0 flex items-center justify-center text-secondary shadow-sm text-xl">📦</div>
                                            )}
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="font-bold text-sm text-primary truncate group-hover:text-accent transition-colors">{dep.title}</span>
                                                <span className="text-xs uppercase font-bold text-secondary tracking-wider mt-0.5">{dep.project_type.replace('project_type:', '')}</span>
                                            </div>
                                            <div className="shrink-0 flex items-center">
                                                <span className={cn("px-2 py-1 text-[10px] uppercase font-bold rounded-md border", getTagBadgeStyle(depType))}>
                                                    {t(`mod_details.dep_${depType}`, { defaultValue: depType })}
                                                </span>
                                            </div>
                                        </div>
                                    );

                                })}
                            </div>

                        </section>
                    )}
                </div>
            </div>

            {selectedFileToInstall && version && (
                <InstallModModal
                    isOpen={Boolean(selectedFileToInstall)}
                    onClose={() => setSelectedFileToInstall(null)}
                    modTitle={version.name}
                    versionName={version.name}
                    fileUrl={selectedFileToInstall.url}
                    fileName={selectedFileToInstall.filename}
                    projectId={id}
                    versionId={version.id}
                    gameVersions={version.game_versions}
                    loaders={version.loaders}
                />
            )}
        </motion.div>
    );
}