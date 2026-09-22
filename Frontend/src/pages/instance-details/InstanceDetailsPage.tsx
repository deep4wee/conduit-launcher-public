import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Square, Settings, ChevronDown, ChevronLeft, Search, Box, RefreshCw, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { invoke } from '@/shared/ipc/ipcClient';

import { useInstanceStore, instanceApi, InstanceDto, InstalledModDto } from '@/entities/instance';
import { Button } from '@/shared/ui/Button';
import { Dropdown } from '@/shared/ui/Dropdown';
import { useBrowserStore } from '@/features/mod-search';
import { useTaskStore, getTaskType, getTaskProgress, getTaskInstanceId } from '@/entities/task';
import { InstalledModsTable } from './ui/InstalledModsTable';
import { ExportModpackModal } from '@/features/modpack-export/ui/ExportModpackModal';
import { InstanceSettingsModal } from './ui/InstanceSettingsModal';

export function InstanceDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { instances, fetchInstances, launchingInstances, launchInstance } = useInstanceStore();
    const { setTargetInstance } = useBrowserStore();
    const { tasks } = useTaskStore();
    
    const [instance, setInstance] = useState<InstanceDto | null>(null);
    const [activeTab, setActiveTab] = useState<'mods' | 'resourcepacks' | 'logs'>('mods');
    const [mods, setMods] = useState<InstalledModDto[]>([]);

    useEffect(() => {
        if (instance && (instance.loaderType.toLowerCase() === 'vanilla' || instance.loaderType === '') && activeTab === 'mods') {
            setActiveTab('resourcepacks');
        }
    }, [instance, activeTab]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [modFilter, setModFilter] = useState<'all' | 'disabled'>('all');

    const fetchMods = async () => {
        if (!id) return;
        try {
            const result = await instanceApi.getInstalledMods(id);
            setMods(result);
        } catch (e) {
            console.error(e);
        }
    };

    const handleScan = async () => {
        if (!id || isScanning) return;
        setIsScanning(true);
        try {
            await instanceApi.scanMods(id);
            await fetchMods();
        } finally {
            setIsScanning(false);
        }
    };

    useEffect(() => {
        fetchInstances();
    }, [fetchInstances]);

    useEffect(() => {
        if (id && instances.length > 0) {
            const found = instances.find(i => i.id === id);
            setInstance(found || null);
            fetchMods();
        }
    }, [id, instances]);

    const displayedMods = useMemo(() => {
        if (modFilter === 'disabled') {
            return mods.filter(m => !m.isEnabled);
        }
        return mods;
    }, [mods, modFilter]);

    if (!instance) {
        return (
            <div className="flex items-center justify-center h-full text-secondary">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    const handleInstallContent = () => {
        setTargetInstance(instance);
        navigate('/browser');
    };

    return (
        <motion.div 
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col bg-background overflow-hidden relative"
        >
            {/* Header */}
            <div className="px-6 py-6 flex items-center justify-between border-b border-border bg-surface/30 shrink-0 shadow-sm relative z-20">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <button 
                        onClick={() => navigate('/instances')} 
                        className="p-2 rounded-xl bg-surface border border-border hover:border-secondary text-secondary hover:text-primary transition-colors outline-none shrink-0"
                        title={t('common.back', 'Back')}
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div className="w-16 h-16 rounded-2xl bg-surface border border-border/80 shadow-md flex items-center justify-center shrink-0 overflow-hidden text-2xl font-black text-secondary">
                        {instance.iconBase64 ? (
                            <img src={instance.iconBase64} alt={instance.name} className="w-full h-full object-cover" />
                        ) : (
                            instance.name.charAt(0).toUpperCase()
                        )}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <h1 className="text-2xl font-black tracking-tight text-primary truncate">{instance.name}</h1>
                        <div className="flex items-center gap-3 mt-1 text-sm font-medium text-secondary">
                            <span className="flex items-center gap-1">
                                <Box className="w-4 h-4" /> 
                                <span className="capitalize">{instance.loaderType}</span> {instance.minecraftVersion}
                            </span>
                            <span>•</span>
                            <span>{Math.floor((instance.playTimeSeconds || 0) / 3600)} {t('instance.hours', 'hours')}</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                    {(() => {
                        const isThisInstanceLaunching = !!launchingInstances?.[instance.id];
                        const gameTask = tasks.find(t => getTaskInstanceId(t) === instance.id && getTaskType(t) === 'game');
                        const downloadTask = tasks.find(t => getTaskInstanceId(t) === instance.id && (getTaskType(t) === 'download' || getTaskType(t) === 'install'));
                        
                        if (gameTask) {
                            return (
                                <Button 
                                    variant="danger" 
                                    onClick={() => invoke('KILL_PROCESS')}
                                    className="flex items-center gap-2 px-6 py-2.5 font-bold bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Square className="w-4 h-4 fill-current" /> 
                                    {t('instance.stop', 'Stop')}
                                </Button>
                            );
                        }

                        if (downloadTask) {
                            const progress = getTaskProgress(downloadTask);
                            return (
                                <Button 
                                    variant="secondary" 
                                    className="flex items-center gap-2 px-6 py-2.5 font-bold relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 bottom-0 bg-accent/20 transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    <span className="relative z-10 flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                        {progress}%
                                    </span>
                                </Button>
                            );
                        }

                        if (isThisInstanceLaunching) {
                            return (
                                <Button 
                                    variant="secondary" 
                                    className="flex items-center gap-2 px-6 py-2.5 font-bold opacity-80 cursor-default"
                                    disabled
                                >
                                    <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                                    {t('launcher.launching', 'Launching...')}
                                </Button>
                            );
                        }

                        return (
                            <Button 
                                variant="primary" 
                                onClick={() => launchInstance(instance.id)}
                                className="flex items-center gap-2 px-6 py-2.5 font-bold bg-[#1bd96a] hover:bg-emerald-500 text-black border-none"
                            >
                                <Play className="w-4 h-4 fill-current" /> 
                                {t('instance.play', 'Play')}
                            </Button>
                        );
                    })()}
                    <Button variant="secondary" className="p-2.5" onClick={() => setIsSettingsModalOpen(true)}>
                        <Settings className="w-5 h-5" />
                    </Button>
                    <Dropdown
                        align="right"
                        trigger={
                            <Button variant="secondary" className="p-2.5">
                                <MoreVertical className="w-5 h-5" />
                            </Button>
                        }
                    >
                        <div className="w-48 p-1 flex flex-col">
                            <button className="text-left px-3 py-2 text-sm text-primary hover:bg-surfaceHover rounded-lg" onClick={() => instanceApi.openInstanceFolder(instance.id)}>
                                {t('instance.openFolder', 'Open Folder')}
                            </button>
                            <button className="text-left px-3 py-2 text-sm text-primary hover:bg-surfaceHover rounded-lg" onClick={() => setIsExportModalOpen(true)}>
                                {t('dashboard.export', 'Export modpack')}
                            </button>
                            <button 
                                className="text-left px-3 py-2 text-sm text-red-400 hover:bg-red-400/10 rounded-lg"
                                onClick={async () => {
                                    if (window.confirm(t('instances.confirmDelete', 'Are you sure you want to delete this instance?'))) {
                                        await instanceApi.deleteInstance(instance.id);
                                        navigate('/instances');
                                    }
                                }}
                            >
                                {t('common.delete', 'Delete')}
                            </button>
                        </div>
                    </Dropdown>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="flex items-center gap-6 px-8 pt-4 border-b border-border bg-background/95 shrink-0 z-10 backdrop-blur-md">
                    {(['mods', 'resourcepacks', 'logs'] as const)
                        .filter(tab => !(tab === 'mods' && (instance.loaderType.toLowerCase() === 'vanilla' || instance.loaderType === '')))
                        .map(tab => (
                        <button 
                            key={tab}
                            onClick={() => setActiveTab(tab)} 
                            className="pb-4 text-sm font-bold transition-all outline-none border-b-[3px] whitespace-nowrap capitalize border-transparent text-secondary hover:text-primary"
                            style={activeTab === tab ? { borderColor: 'var(--color-accent)', color: 'var(--text-primary)' } : {}}
                        >
                            {t(`instance.tabs.${tab}`, tab)}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    {activeTab === 'mods' && (
                        <div className="flex flex-col gap-4 h-full">
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="relative">
                                            <Search className="w-4 h-4 text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                                            <input 
                                                type="text" 
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                                placeholder={t('dashboard.searchMods', 'Search projects...')} 
                                                className="w-full sm:w-80 md:w-96 bg-surface border border-border rounded-xl py-2 pl-9 pr-4 text-sm text-primary outline-none focus:border-secondary transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button 
                                            variant="secondary" 
                                            className="p-2 text-sm" 
                                            title={t('dashboard.scanMods', 'Scan dropped mods')} 
                                            disabled={isScanning}
                                            onClick={handleScan}
                                        >
                                            <Search className={cn("w-4 h-4", isScanning && "animate-spin text-accent")} />
                                        </Button>
                                        <Button variant="secondary" className="p-2 text-sm" title={t('common.refresh', 'Refresh')} onClick={fetchMods}>
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                        <Dropdown 
                                            align="right"
                                            trigger={
                                            <Button variant="primary" className="text-sm px-4 py-2 flex items-center gap-2">
                                                + {t('dashboard.installContent', 'Install content')}
                                                <ChevronDown className="w-4 h-4" />
                                            </Button>
                                        }>
                                            <div className="w-48 p-1 flex flex-col">
                                                <button className="text-left px-3 py-2 text-sm text-primary hover:bg-surfaceHover rounded-lg" onClick={handleInstallContent}>
                                                    {t('dashboard.browse', 'Browse Modrinth')}
                                                </button>
                                            </div>
                                        </Dropdown>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setModFilter('all')}
                                        className={cn(
                                            "px-3 py-1 border transition-colors rounded-full text-xs font-bold",
                                            modFilter === 'all'
                                                ? "bg-accent/20 border-accent/40 text-accent"
                                                : "bg-surface border-border hover:border-secondary text-secondary"
                                        )}
                                    >
                                        {t('dashboard.allProjects', 'All Projects')} ({mods.length})
                                    </button>
                                    <button 
                                        onClick={() => setModFilter(f => f === 'disabled' ? 'all' : 'disabled')}
                                        className={cn(
                                            "px-3 py-1 border transition-colors rounded-full text-xs font-bold",
                                            modFilter === 'disabled'
                                                ? "bg-accent/20 border-accent/40 text-accent"
                                                : "bg-surface border-border hover:border-secondary text-secondary"
                                        )}
                                    >
                                        {t('dashboard.disabledProjects', 'Disabled Projects')} ({mods.filter(m => !m.isEnabled).length})
                                    </button>
                                </div>
                            </div>

                            <InstalledModsTable 
                                instanceId={instance.id} 
                                mods={displayedMods} 
                                searchQuery={searchQuery} 
                                onRefresh={fetchMods} 
                            />
                        </div>
                    )}

                    {activeTab === 'resourcepacks' && (
                        <div className="flex items-center justify-center h-full text-secondary">
                            Resource Packs (Coming Soon)
                        </div>
                    )}
                    
                    {activeTab === 'logs' && (
                        <div className="flex items-center justify-center h-full text-secondary">
                            Logs (Coming Soon)
                        </div>
                    )}
                </div>
            </div>

            <ExportModpackModal 
                isOpen={isExportModalOpen} 
                onClose={() => setIsExportModalOpen(false)} 
                instanceId={instance.id} 
                mods={mods} 
            />

            <InstanceSettingsModal 
                isOpen={isSettingsModalOpen} 
                onClose={() => {
                    setIsSettingsModalOpen(false);
                    fetchInstances(); // refresh to get new name
                }} 
                instance={instance} 
            />
        </motion.div>
    );
}
