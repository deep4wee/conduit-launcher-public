import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Settings2, FolderDown, TerminalSquare, ImagePlus, Save, Wrench, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { Switch } from '@/shared/ui/Switch';
import { cn } from '@/shared/lib/utils';
import { InstanceDto, instanceApi, useInstanceStore } from '@/entities/instance';
import { useToastStore } from '@/shared/ui/Toast';
import { useVersionStore } from '@/entities/version/model/versionStore';
import { useJavaStore } from '@/entities/java';
import { SearchableSelect, SelectOption } from '@/shared/ui/SearchableSelect';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    instance: InstanceDto;
}

type TabType = 'general' | 'installation' | 'overrides';

export function InstanceSettingsModal({ isOpen, onClose, instance }: Props) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<TabType>('general');
    const [isSaving, setIsSaving] = useState(false);

    // Form State
    const [name, setName] = useState(instance.name);
    const [iconBase64, setIconBase64] = useState<string | null>(instance.iconBase64);
    const [storageMode, setStorageMode] = useState(instance.storageMode);
    
    const [mcVersion, setMcVersion] = useState(instance.minecraftVersion);
    const [loaderType, setLoaderType] = useState(instance.loaderType || 'Vanilla');
    const [loaderVersion, setLoaderVersion] = useState(instance.loaderVersion || '');
    
    // RAM State (with Unit Toggle)
    const [ramMemory, setRamMemory] = useState<number>(instance.overrideMemory || 0);
    const [ramUnit, setRamUnit] = useState<'MB' | 'GB'>('MB');

    // Overrides
    const [overrideJavaPath, setOverrideJavaPath] = useState(instance.overrideJavaPath || '');
    const [jvmFlags, setJvmFlags] = useState(instance.jvmFlags || '');
    const [windowWidth, setWindowWidth] = useState(instance.windowWidth?.toString() || '');
    const [windowHeight, setWindowHeight] = useState(instance.windowHeight?.toString() || '');
    const [fullscreen, setFullscreen] = useState(instance.fullscreen || false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initialization logic for RAM unit display
    useEffect(() => {
        if (ramMemory > 0 && ramMemory % 1024 === 0) {
            setRamUnit('GB');
        } else {
            setRamUnit('MB');
        }
    }, []);

    // Stores
    const { detectAll } = useJavaStore();
    const { 
        vanillaVersions, fabricLoaders, forgeLoaders, neoForgeLoaders, quiltLoaders, liteLoaderLoaders,
        fetchVanilla, fetchFabric, fetchForge, fetchNeoForge, fetchQuilt, fetchLiteLoader, fetchForgeSupportedVersions
    } = useVersionStore();

    useEffect(() => {
        if (isOpen) {
            fetchVanilla();
            fetchFabric();
            fetchQuilt();
            fetchForgeSupportedVersions();
            detectAll();
        }
    }, [isOpen]);

    useEffect(() => {
        if (mcVersion && loaderType === 'Forge') fetchForge(mcVersion);
        if (mcVersion && loaderType === 'NeoForge') fetchNeoForge(mcVersion);
        if (mcVersion && loaderType === 'LiteLoader') fetchLiteLoader(mcVersion);
    }, [mcVersion, loaderType]);

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => setIconBase64(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleRamChange = (val: string) => {
        const num = parseFloat(val);
        if (isNaN(num) || num < 0) { setRamMemory(0); return; }
        setRamMemory(num);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            let finalRam = ramMemory;
            if (ramUnit === 'GB' && finalRam > 0) finalRam = Math.floor(finalRam * 1024);

            await instanceApi.updateInstance(instance.id, {
                name,
                iconBase64,
                storageMode,
                minecraftVersion: mcVersion,
                loaderType,
                loaderVersion,
                overrideMemory: finalRam > 0 ? finalRam : 0,
                overrideJavaPath,
                jvmFlags,
                windowWidth: windowWidth ? parseInt(windowWidth) : 0,
                windowHeight: windowHeight ? parseInt(windowHeight) : 0,
                fullscreen
            });
            useToastStore.getState().addToast({ message: t('instance.settingsSaved'), type: 'success' });
            onClose();
        } catch (e: any) {
            useToastStore.getState().addToast({ message: e.message || t('instance.saveFailed'), type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const mcVersionOptions: SelectOption[] = useMemo(() => 
        vanillaVersions
            .filter(v => v.type === 'release' && v.id.startsWith('1.'))
            .map(v => ({ value: v.id, label: v.id })),
        [vanillaVersions]
    );

    const loaderOptions: SelectOption[] = useMemo(() => {
        if (loaderType === 'Fabric') return fabricLoaders.map(v => ({ value: v, label: v }));
        if (loaderType === 'Quilt') return quiltLoaders.map(v => ({ value: v, label: v }));
        if (loaderType === 'Forge' && mcVersion) return (forgeLoaders[mcVersion] || []).map(v => ({ value: v, label: v }));
        if (loaderType === 'NeoForge' && mcVersion) return (neoForgeLoaders[mcVersion] || []).map(v => ({ value: v, label: v }));
        if (loaderType === 'LiteLoader' && mcVersion) return (liteLoaderLoaders[mcVersion] || []).map(v => ({ value: v, label: v }));
        return [];
    }, [loaderType, mcVersion, fabricLoaders, forgeLoaders, neoForgeLoaders, quiltLoaders, liteLoaderLoaders]);

    const navigate = useNavigate();
    const { deleteInstance } = useInstanceStore();

    const handleDelete = async () => {
        if (window.confirm(t('instance.deleteWarning'))) {
            try {
                await deleteInstance(instance.id);
                onClose();
                navigate('/instances');
            } catch (e: any) {
                useToastStore.getState().addToast({ message: e.message || 'Failed to delete instance', type: 'error' });
            }
        }
    };

    if (!isOpen) return null;

    const tabs = [
        { id: 'general' as const, icon: Settings2, label: t('instance.tabGeneral') },
        { id: 'installation' as const, icon: FolderDown, label: t('instance.tabInstallation') },
        { id: 'overrides' as const, icon: TerminalSquare, label: t('instance.tabOverrides') },
    ];

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full max-w-4xl h-[80vh] bg-background border border-border rounded-2xl shadow-2xl flex overflow-hidden">
                {/* Left Sidebar */}
                <div className="w-64 bg-surface border-r border-border flex flex-col shrink-0">
                    <div className="p-6 pb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-background border border-border flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                                {iconBase64 ? (
                                    <img src={iconBase64} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Settings2 className="w-5 h-5 text-secondary" />
                                )}
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base font-bold truncate leading-tight text-primary">{name || instance.name}</h2>
                                <p className="text-xs text-secondary truncate">{t('settings.instanceSettings')}</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                data-tab={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm outline-none",
                                    activeTab === tab.id
                                        ? "bg-accent/10 text-accent font-semibold"
                                        : "text-secondary hover:bg-surfaceHover hover:text-primary"
                                )}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Content Panel */}
                <div className="flex-1 flex flex-col overflow-hidden bg-background">
                    {/* Header close button */}
                    <div className="h-14 flex items-center justify-end px-4 shrink-0">
                        <button
                            onClick={onClose}
                            data-testid="instance-settings-close-button"
                            className="p-2 hover:bg-surface rounded-full text-secondary hover:text-primary transition-colors outline-none"
                            title={t('common.cancel')}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Scrollable Tab Content */}
                    <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2 custom-scrollbar">
                        {/* GENERAL TAB */}
                        {activeTab === 'general' && (
                            <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
                                <section>
                                    <h3 className="text-xl font-bold">{t('instance.instanceName')}</h3>
                                    <p className="text-sm text-secondary mb-6 mt-1">{t('instance.instanceNameDesc')}</p>
                                    
                                    <div className="flex items-start gap-6 bg-surface p-5 rounded-xl border border-border shadow-sm">
                                        <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleLogoChange} />
                                        <div 
                                            className="relative group cursor-pointer" 
                                            onClick={() => fileInputRef.current?.click()}
                                            title="Click to change icon"
                                        >
                                            <div className="w-20 h-20 rounded-2xl bg-background border border-border/80 shadow-inner flex items-center justify-center shrink-0 overflow-hidden text-3xl font-black text-secondary group-hover:opacity-60 transition-opacity">
                                                {iconBase64 ? (
                                                    <img src={iconBase64} alt="icon" className="w-full h-full object-cover" />
                                                ) : (
                                                    name.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                <ImagePlus className="w-6 h-6 text-white drop-shadow-md" />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="text-xs font-semibold text-secondary block mb-1.5">{t('instance.nameLabel')}</label>
                                            <input 
                                                type="text" 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-primary outline-none focus:border-accent transition-colors"
                                                placeholder={t('instance.namePlaceholder')}
                                            />
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-border/50" />

                                <section>
                                    <h3 className="text-xl font-bold">{t('instance.repair')}</h3>
                                    <p className="text-sm text-secondary mb-6 mt-1">{t('instance.repairDesc')}</p>
                                    
                                    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-center justify-between gap-4">
                                        <div>
                                            <span className="font-bold text-sm text-primary block">{t('instance.repair')}</span>
                                            <span className="text-xs text-secondary mt-0.5 block">{t('instance.repairDesc')}</span>
                                        </div>
                                        <Button 
                                            variant="secondary" 
                                            onClick={async () => {
                                                try {
                                                    await instanceApi.repairInstance(instance.id);
                                                    useToastStore.getState().addToast({ message: "Repair task started in background", type: "info" });
                                                    onClose();
                                                } catch (e: any) {
                                                    useToastStore.getState().addToast({ message: e.message, type: "error" });
                                                }
                                            }} 
                                            className="flex items-center gap-2 text-sm shrink-0"
                                        >
                                            <Wrench className="w-4 h-4" /> {t('instance.repairBtn')}
                                        </Button>
                                    </div>
                                </section>

                                <div className="h-px bg-border/50" />

                                <section>
                                    <h3 className="text-xl font-bold text-red-400">{t('instance.dangerZone')}</h3>
                                    <p className="text-sm text-secondary mb-6 mt-1">{t('instance.deleteWarning')}</p>
                                    
                                    <div className="p-5 rounded-xl border border-red-500/20 bg-red-500/5 flex items-center justify-between gap-4">
                                        <div>
                                            <span className="font-bold text-sm text-red-400 block">{t('instance.deleteConfirm')}</span>
                                            <span className="text-xs text-secondary mt-0.5 block">{t('instance.deleteWarning')}</span>
                                        </div>
                                        <Button variant="primary" onClick={handleDelete} className="bg-red-500 hover:bg-red-600 border-red-500 text-white px-5 py-2.5 text-sm shrink-0">
                                            {t('common.delete')}
                                        </Button>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* INSTALLATION TAB */}
                        {activeTab === 'installation' && (
                            <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
                                <section>
                                    <h3 className="text-xl font-bold">{t('instance.envVersion')}</h3>
                                    <p className="text-sm text-secondary mb-6 mt-1">{t('instance.envVersionDesc')}</p>
                                    
                                    <div className="flex flex-col gap-4 p-5 border border-border rounded-xl bg-surface shadow-sm">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-secondary block mb-1.5">{t('instance.gameVersion')}</label>
                                                <SearchableSelect 
                                                    options={mcVersionOptions} 
                                                    value={mcVersion} 
                                                    onChange={(v) => { setMcVersion(v); setLoaderVersion(''); }} 
                                                    disabled={instance.loaderType !== 'Vanilla' && instance.loaderType !== ''}
                                                />
                                                {instance.loaderType !== 'Vanilla' && instance.loaderType !== '' && (
                                                    <span className="text-[11px] text-orange-400 mt-1.5 block">{t('instance.loaderLocked')}</span>
                                                )}
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-secondary block mb-1.5">{t('instance.loaderLabel')}</label>
                                                <select 
                                                    value={loaderType} 
                                                    onChange={(e) => { setLoaderType(e.target.value as any); setLoaderVersion(''); }} 
                                                    disabled={instance.loaderType === 'Vanilla'}
                                                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-primary outline-none focus:border-accent disabled:opacity-50 transition-colors"
                                                >
                                                    {['Vanilla', 'Fabric', 'Forge', 'NeoForge', 'Quilt', 'LiteLoader'].map(l => <option key={l} value={l}>{l}</option>)}
                                                </select>
                                                {instance.loaderType === 'Vanilla' && (
                                                    <span className="text-[11px] text-orange-400 mt-1.5 block">{t('instance.vanillaLocked')}</span>
                                                )}
                                            </div>
                                        </div>

                                        {loaderType !== 'Vanilla' && (
                                            <div>
                                                <label className="text-xs font-semibold text-secondary block mb-1.5">{loaderType} {t('instance.loaderVersion')}</label>
                                                <SearchableSelect options={loaderOptions} value={loaderVersion} onChange={setLoaderVersion} placeholder={t('instance.selectLoaderVersion')} />
                                            </div>
                                        )}
                                    </div>
                                </section>

                                <div className="h-px bg-border/50" />

                                <section>
                                    <h3 className="text-xl font-bold">{t('instance.storageMode')}</h3>
                                    <p className="text-sm text-secondary mb-6 mt-1">{t('instance.storageModeDesc')}</p>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            type="button"
                                            onClick={() => setStorageMode('Isolated')}
                                            className={cn(
                                                "p-5 rounded-xl font-medium transition-all text-left border-2 outline-none flex flex-col justify-between",
                                                storageMode === 'Isolated'
                                                    ? "border-accent bg-accent/5 text-primary"
                                                    : "border-border hover:border-secondary bg-surface text-secondary"
                                            )}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-sm text-primary">{t('instance.isolated')}</span>
                                                {storageMode === 'Isolated' && (
                                                    <span className="text-[10px] font-bold bg-accent text-[#11111b] px-2 py-0.5 rounded-full">Active</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-secondary mt-1">{t('instance.isolatedDesc')}</p>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => setStorageMode('Global')}
                                            className={cn(
                                                "p-5 rounded-xl font-medium transition-all text-left border-2 outline-none flex flex-col justify-between",
                                                storageMode === 'Global'
                                                    ? "border-accent bg-accent/5 text-primary"
                                                    : "border-border hover:border-secondary bg-surface text-secondary"
                                            )}
                                        >
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-sm text-primary">{t('instance.globalCache')}</span>
                                                {storageMode === 'Global' && (
                                                    <span className="text-[10px] font-bold bg-accent text-[#11111b] px-2 py-0.5 rounded-full">Active</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-secondary mt-1">{t('instance.globalCacheDesc')}</p>
                                        </button>
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* OVERRIDES TAB */}
                        {activeTab === 'overrides' && (
                            <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-300">
                                {/* RAM Memory */}
                                <section>
                                    <h3 className="text-xl font-bold">{t('instance.maxRam')}</h3>
                                    <p className="text-sm text-secondary mb-6 mt-1">{t('instance.maxRamDesc')}</p>
                                    
                                    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex items-center gap-4">
                                        <input 
                                            type="number" 
                                            min="0"
                                            placeholder={ramUnit === 'GB' ? "2" : "2048"}
                                            value={ramMemory > 0 ? (ramUnit === 'GB' ? (ramMemory / 1024).toFixed(1).replace('.0', '') : ramMemory) : ''}
                                            onChange={(e) => handleRamChange(e.target.value)}
                                            className="w-36 bg-background border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-primary outline-none focus:border-accent"
                                        />
                                        <div className="flex bg-surfaceHover border border-border rounded-lg p-1">
                                            <button 
                                                type="button"
                                                onClick={() => setRamUnit('MB')} 
                                                className={cn("px-3 py-1 text-xs font-bold rounded-md transition-colors outline-none", ramUnit === 'MB' ? "bg-surface text-primary shadow-sm" : "text-secondary hover:text-primary")}
                                            >
                                                MB
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={() => setRamUnit('GB')} 
                                                className={cn("px-3 py-1 text-xs font-bold rounded-md transition-colors outline-none", ramUnit === 'GB' ? "bg-surface text-primary shadow-sm" : "text-secondary hover:text-primary")}
                                            >
                                                GB
                                            </button>
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-border/50" />

                                {/* Window Resolution */}
                                <section>
                                    <h3 className="text-xl font-bold">{t('instance.windowSettings')}</h3>
                                    <p className="text-sm text-secondary mb-6 mt-1">{t('instance.windowSettingsDesc')}</p>
                                    
                                    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <Switch checked={fullscreen} onChange={() => setFullscreen(!fullscreen)} />
                                            <span className="text-sm font-medium text-primary">{t('instance.fullscreen')}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-semibold text-secondary block mb-1.5">{t('instance.width')}</label>
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    placeholder="854" 
                                                    disabled={fullscreen} 
                                                    value={windowWidth} 
                                                    onChange={(e) => setWindowWidth(e.target.value)} 
                                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent disabled:opacity-50 transition-colors" 
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-semibold text-secondary block mb-1.5">{t('instance.height')}</label>
                                                <input 
                                                    type="number" 
                                                    min="0" 
                                                    placeholder="480" 
                                                    disabled={fullscreen} 
                                                    value={windowHeight} 
                                                    onChange={(e) => setWindowHeight(e.target.value)} 
                                                    className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent disabled:opacity-50 transition-colors" 
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="h-px bg-border/50" />

                                {/* Java Path Override */}
                                <section>
                                    <h3 className="text-xl font-bold">{t('instance.customJava')}</h3>
                                    <p className="text-sm text-secondary mb-6 mt-1">{t('instance.customJavaDesc')}</p>
                                    
                                    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                                        <input 
                                            type="text" 
                                            value={overrideJavaPath} 
                                            onChange={(e) => setOverrideJavaPath(e.target.value)} 
                                            placeholder={t('instance.javaPathPlaceholder')}
                                            className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent font-mono transition-colors"
                                        />
                                    </div>
                                </section>

                                <div className="h-px bg-border/50" />

                                {/* Custom JVM Arguments */}
                                <section>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-bold">{t('instance.customJvmArgs')}</h3>
                                        <span title="Example: -XX:+UseG1GC -XX:+ParallelRefProcEnabled -XX:MaxGCPauseMillis=200" className="cursor-help text-secondary hover:text-accent transition-colors">
                                            <HelpCircle className="w-4 h-4" />
                                        </span>
                                    </div>
                                    <p className="text-sm text-secondary mb-6 mt-1">{t('instance.customJvmArgsDesc')}</p>
                                    
                                    <div className="bg-surface p-5 rounded-xl border border-border shadow-sm">
                                        <textarea 
                                            value={jvmFlags} 
                                            onChange={(e) => setJvmFlags(e.target.value)} 
                                            placeholder="-XX:+UseG1GC -XX:+ParallelRefProcEnabled ..."
                                            className="w-full h-32 bg-background border border-border rounded-xl px-4 py-3 text-sm text-primary outline-none focus:border-accent font-mono resize-none custom-scrollbar transition-colors"
                                        />
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 px-8 border-t border-border bg-surface/50 flex justify-end gap-3 shrink-0">
                        <Button variant="secondary" data-testid="instance-settings-cancel-button" onClick={onClose} disabled={isSaving}>{t('common.cancel')}</Button>
                        <Button variant="primary" data-testid="instance-settings-save-button" onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                            {isSaving ? <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" /> : <Save className="w-4 h-4" />}
                            {t('instance.saveChanges')}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
