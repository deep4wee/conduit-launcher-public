import { useNavigate } from 'react-router-dom';
import { ExternalLink, ShieldCheck, Monitor, Server } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { usePrefsStore } from '@/entities/prefs';
import { formatDate } from '@/shared/lib/formatters';
import { ModDetails, TeamMember, DependencyProject } from '@/shared/api/types/modrinth';

interface ModSidebarProps {
    project: ModDetails;
    team: TeamMember[];
    dependencies: DependencyProject[];
}

export function ModInfoSidebar({ project, team, dependencies }: ModSidebarProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { openExternalUrl } = usePrefsStore();

    return (
        <div className="flex flex-col p-8 gap-8 bg-surface/10 h-full">

            <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">{t('mod_details.compatibility')}</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-4 bg-surface px-4 py-3 rounded-xl border border-border shadow-sm">
                        <Monitor className="w-6 h-6 text-secondary shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs text-secondary">{t('mod_details.client')}</span>
                            <span className={cn("font-bold text-sm uppercase tracking-wide truncate", project.client_side === 'required' ? "text-accent" : "text-primary")}>{project.client_side}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 bg-surface px-4 py-3 rounded-xl border border-border shadow-sm">
                        <Server className="w-6 h-6 text-secondary shrink-0" />
                        <div className="flex flex-col flex-1 min-w-0">
                            <span className="text-xs text-secondary">{t('mod_details.server')}</span>
                            <span className={cn("font-bold text-sm uppercase tracking-wide truncate", project.server_side === 'required' ? "text-accent" : "text-primary")}>{project.server_side}</span>
                        </div>
                    </div>
                </div>
            </section>

            <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">{t('mod_details.links')}</h3>
                <div className="flex flex-col gap-2">
                    {project.source_url && (
                        <span onClick={() => openExternalUrl(project.source_url!)} className="flex items-center gap-3 text-sm text-primary hover:text-accent transition-colors bg-surface hover:bg-surfaceHover px-4 py-3 rounded-xl border border-border cursor-pointer font-medium shadow-sm">
                            <ExternalLink className="w-4 h-4 text-secondary" /> {t('mod_details.source_code')}
                        </span>
                    )}
                    {project.issues_url && (
                        <span onClick={() => openExternalUrl(project.issues_url!)} className="flex items-center gap-3 text-sm text-primary hover:text-accent transition-colors bg-surface hover:bg-surfaceHover px-4 py-3 rounded-xl border border-border cursor-pointer font-medium shadow-sm">
                            <ShieldCheck className="w-4 h-4 text-secondary" /> {t('mod_details.report_issues')}
                        </span>
                    )}
                    {project.wiki_url && (
                        <span onClick={() => openExternalUrl(project.wiki_url!)} className="flex items-center gap-3 text-sm text-primary hover:text-accent transition-colors bg-surface hover:bg-surfaceHover px-4 py-3 rounded-xl border border-border cursor-pointer font-medium shadow-sm">
                            <ExternalLink className="w-4 h-4 text-secondary" /> {t('mod_details.wiki')}
                        </span>
                    )}
                </div>
            </section>

            {project.categories && project.categories.length > 0 && (
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">{t('mod_details.tags')}</h3>
                    <div className="flex flex-wrap gap-2">
                        {project.categories.map(cat => (
                            <span key={cat} className="px-3 py-1.5 rounded-full bg-surface border border-border text-xs font-medium text-secondary capitalize shadow-sm">
                                {t(`browser.mod_categories.${cat}`, { defaultValue: cat.replace('-', ' ') })}
                            </span>
                        ))}
                    </div>
                </section>
            )}

            {team && team.length > 0 && (
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">{t('mod_details.authors')}</h3>
                    <div className="flex flex-col gap-3">
                        {team.map(member => (
                            <div key={member.user.id} className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-border shadow-sm group hover:border-secondary transition-colors cursor-pointer" onClick={() => openExternalUrl(`https://modrinth.com/user/${member.user.username}`)}>
                                <img src={member.user.avatar_url} alt={member.user.username} className="w-10 h-10 rounded-full bg-background shrink-0 shadow-sm" />
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-sm text-primary truncate group-hover:text-accent transition-colors">{member.user.name || member.user.username}</span>
                                    <span className="text-xs text-secondary capitalize truncate">{member.role}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {dependencies && dependencies.length > 0 && (
                <section>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">{t('mod_details.dependencies')}</h3>
                    <div className="flex flex-col gap-3">
                        {dependencies.map(dep => (
                            <div
                                key={dep.id}
                                className="flex items-center gap-3 bg-surface p-3 rounded-xl border border-border shadow-sm group hover:border-secondary transition-colors cursor-pointer"
                                onClick={() => navigate(`/browser/mod/${dep.id}`)}
                                onContextMenu={(e) => {
                                    e.preventDefault();
                                    openExternalUrl(`https://modrinth.com/${dep.project_type.replace('project_type:', '')}/${dep.id}`);
                                }}
                                title={t('mod_details.link_action_hint')}
                            >

                                {dep.icon_url ? (
                                    <img src={dep.icon_url} alt={dep.title} className="w-10 h-10 rounded-xl bg-background shrink-0 shadow-sm object-cover" />
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-background shrink-0 flex items-center justify-center text-secondary shadow-sm">📦</div>
                                )}
                                <div className="flex flex-col min-w-0">
                                    <span className="font-bold text-sm text-primary truncate group-hover:text-accent transition-colors">{dep.title}</span>
                                    <span className="text-[10px] uppercase font-bold text-secondary tracking-wider">{dep.project_type.replace('project_type:', '')}</span>
                                </div>
                            </div>
                        ))}

                    </div>
                </section>
            )}

            <section>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary mb-3">{t('mod_details.details')}</h3>

                <div className="flex flex-col gap-4 text-sm bg-surface p-5 rounded-xl border border-border shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                        <span className="text-secondary shrink-0 mt-0.5">{t('mod_details.project_type')}</span>
                        <span className="text-primary capitalize font-bold text-right break-words min-w-0">{project.project_type.replace('project_type:', '')}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                        <span className="text-secondary shrink-0 mt-0.5">{t('mod_details.license')}</span>
                        <span onClick={() => openExternalUrl(project.license.url)} className="text-accent hover:underline cursor-pointer font-bold text-right break-words min-w-0 leading-tight">{project.license.name}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                        <span className="text-secondary shrink-0 mt-0.5">{t('mod_details.published')}</span>
                        <span className="text-primary font-bold text-right break-words min-w-0 leading-tight">{formatDate(project.published)}</span>
                    </div>
                    <div className="flex justify-between items-start gap-4">
                        <span className="text-secondary shrink-0 mt-0.5">{t('mod_details.updated')}</span>
                        <span className="text-primary font-bold text-right break-words min-w-0 leading-tight">{formatDate(project.updated)}</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
