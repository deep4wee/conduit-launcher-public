import { useState } from 'react';
import { X, Settings2, FolderDown, Cpu, TerminalSquare, ImagePlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/utils';
import { InstanceDto, instanceApi } from '@/entities/instance';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    instance: InstanceDto;
}

export function InstanceSettingsModal({ isOpen, onClose, instance }: Props) {
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'general' | 'storage' | 'java' | 'args'>('general');
    const [newName, setNewName] = useState(instance.name);

    if (!isOpen) return null;

    const handleSaveClose = async () => {
        try {
            if (newName !== instance.name) {
                await instanceApi.renameInstance(instance.id, newName);
            }
        } catch (e) {
            console.error(e);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface w-full max-w-4xl rounded-2xl shadow-2xl border border-border flex flex-col relative overflow-hidden h-[75vh]">
                <div className="flex items-center justify-between p-5 border-b border-border bg-surfaceHover/30 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center border border-border/50">
                            {instance.iconBase64 ? (
                                <img src={instance.iconBase64} alt="" className="w-6 h-6 object-cover rounded" />
                            ) : (
                                <Settings2 className="w-5 h-5 text-secondary" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-primary">{t('settings.instanceSettings', 'Instance Settings')}</h2>
                            <p className="text-xs text-secondary font-medium truncate w-64">{instance.name}</p>
                        </div>
                    </div>
                    <button onClick={handleSaveClose} className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-surface transition-colors outline-none">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="w-64 border-r border-border bg-surfaceHover/10 p-5 flex flex-col gap-2 shrink-0">
                        <button 
                            onClick={() => setActiveTab('general')}
                            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors outline-none", activeTab === 'general' ? "bg-accent/10 text-accent border border-accent/20" : "text-secondary hover:bg-surface border border-transparent")}
                        >
                            <Settings2 className="w-4 h-4" /> {t('settings.general', 'General')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('storage')}
                            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors outline-none", activeTab === 'storage' ? "bg-accent/10 text-accent border border-accent/20" : "text-secondary hover:bg-surface border border-transparent")}
                        >
                            <FolderDown className="w-4 h-4" /> {t('settings.tabs.storage', 'Storage & Installation')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('java')}
                            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors outline-none", activeTab === 'java' ? "bg-accent/10 text-accent border border-accent/20" : "text-secondary hover:bg-surface border border-transparent")}
                        >
                            <Cpu className="w-4 h-4" /> {t('settings.tabs.java', 'Java & Memory')}
                        </button>
                        <button 
                            onClick={() => setActiveTab('args')}
                            className={cn("flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-colors outline-none", activeTab === 'args' ? "bg-accent/10 text-accent border border-accent/20" : "text-secondary hover:bg-surface border border-transparent")}
                        >
                            <TerminalSquare className="w-4 h-4" /> {t('settings.args', 'Launch Arguments')}
                        </button>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar bg-background">
                        {activeTab === 'general' && (
                            <div className="flex flex-col gap-8 max-w-lg">
                                {/* Icon and Name */}
                                <div className="flex items-start gap-6">
                                    <div className="relative group cursor-pointer">
                                        <div className="w-20 h-20 rounded-2xl bg-surface border border-border/80 shadow-md flex items-center justify-center shrink-0 overflow-hidden text-3xl font-black text-secondary group-hover:opacity-50 transition-opacity">
                                            {instance.iconBase64 ? (
                                                <img src={instance.iconBase64} alt={instance.name} className="w-full h-full object-cover" />
                                            ) : (
                                                instance.name.charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ImagePlus className="w-6 h-6 text-white drop-shadow-md" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-sm font-bold text-primary mb-1">{t('settings.instanceName', 'Instance Name')}</h3>
                                        <p className="text-xs text-secondary mb-3">{t('settings.instanceNameDesc', 'The display name of the instance.')}</p>
                                        <input 
                                            type="text" 
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            className="w-full bg-surface border border-border rounded-xl px-4 py-2.5 text-sm font-medium text-primary outline-none focus:border-accent transition-colors"
                                        />
                                    </div>
                                </div>

                                {/* Game & Loader Info */}
                                <div className="p-4 rounded-xl border border-border bg-surfaceHover/10">
                                    <h3 className="text-sm font-bold text-primary mb-3">Environment</h3>
                                    <div className="flex flex-col gap-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-secondary">Minecraft Version</span>
                                            <span className="font-bold text-primary">{instance.minecraftVersion}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-secondary">Mod Loader</span>
                                            <span className="font-bold text-primary capitalize">{instance.loaderType} {instance.loaderVersion}</span>
                                        </div>
                                    </div>
                                    {/* Placeholder for change version button */}
                                    <Button variant="secondary" className="w-full mt-4 text-xs">
                                        Change Version (Coming soon)
                                    </Button>
                                </div>

                                {/* Danger Zone */}
                                <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5 mt-4">
                                    <h3 className="text-sm font-bold text-red-400 mb-1">{t('settings.dangerZone', 'Danger Zone')}</h3>
                                    <p className="text-xs text-secondary mb-3">{t('settings.deleteWarning', 'Once you delete an instance, there is no going back. Please be certain.')}</p>
                                    <Button variant="primary" className="bg-red-500 hover:bg-red-600 border-red-500 text-white px-4 py-2 text-sm">
                                        {t('common.delete', 'Delete Instance')}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {activeTab === 'storage' && (
                            <div className="flex flex-col gap-6 max-w-lg">
                                <div>
                                    <h3 className="text-sm font-bold text-primary mb-1">{t('settings.storageMode', 'Storage Mode')}</h3>
                                    <p className="text-xs text-secondary mb-3">{t('settings.storageModeDesc', 'Choose how mods are stored for this instance.')}</p>
                                    
                                    <div className="flex flex-col gap-3">
                                        <div className={cn("p-4 border rounded-xl transition-all", instance.storageMode === 'Isolated' ? "border-accent bg-accent/5" : "border-border bg-surface/50 opacity-70")}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-sm text-primary">Isolated</span>
                                                {instance.storageMode === 'Isolated' && <span className="text-[10px] font-bold bg-accent text-white px-2 py-0.5 rounded-full">Active</span>}
                                            </div>
                                            <p className="text-xs text-secondary">Standard mode. Mods are copied directly into the instance folder.</p>
                                        </div>
                                        <div className={cn("p-4 border rounded-xl transition-all", instance.storageMode === 'Global' ? "border-accent bg-accent/5" : "border-border bg-surface/50 opacity-70")}>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="font-bold text-sm text-primary">Global Cache & Hardlinks</span>
                                                {instance.storageMode === 'Global' && <span className="text-[10px] font-bold bg-accent text-white px-2 py-0.5 rounded-full">Active</span>}
                                            </div>
                                            <p className="text-xs text-secondary">Mods are stored in a central repository and linked here to save disk space.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'java' && (
                            <div className="flex flex-col gap-6 max-w-lg">
                                <p className="text-sm text-secondary">
                                    Override global Java settings for this specific instance. (Coming soon)
                                </p>
                            </div>
                        )}

                        {activeTab === 'args' && (
                            <div className="flex flex-col gap-6 max-w-lg">
                                <p className="text-sm text-secondary">
                                    Override JVM launch arguments. (Coming soon)
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
