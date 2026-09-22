import { useState, useEffect, useMemo } from 'react';
import { X, Download, Check, Layers, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/utils';
import { useInstanceStore, instanceApi } from '@/entities/instance';
import { useBrowserStore } from '@/features/mod-search';
import { useToastStore } from '@/shared/ui/Toast';

export interface InstallModModalProps {
  isOpen: boolean;
  onClose: () => void;
  modTitle: string;
  versionName?: string;
  fileUrl: string;
  fileName: string;
  projectId?: string;
  versionId?: string;
  gameVersions?: string[];
  loaders?: string[];
  environment?: string;
  source?: string;
}

export function InstallModModal({
  isOpen,
  onClose,
  modTitle,
  versionName,
  fileUrl,
  fileName,
  projectId,
  versionId,
  gameVersions = [],
  loaders = [],
  environment = 'Both',
  source = 'Modrinth'
}: InstallModModalProps) {
  const { t } = useTranslation();
  const { instances, fetchInstances } = useInstanceStore();
  const { targetInstance } = useBrowserStore();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [isInstalling, setIsInstalling] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchInstances();
      if (targetInstance) {
        setSelectedInstanceId(targetInstance.id);
      }
    }
  }, [isOpen, targetInstance, fetchInstances]);

  // If no instance selected yet, default to first compatible or simply first instance
  const filteredInstances = useMemo(() => {
    return instances.filter(inst => {
      const matchVer = gameVersions.length === 0 || gameVersions.includes(inst.minecraftVersion);
      const matchLoader = loaders.length === 0 || loaders.map(l => l.toLowerCase()).includes(inst.loaderType.toLowerCase());
      return matchVer && matchLoader;
    });
  }, [instances, gameVersions, loaders]);

  useEffect(() => {
    if (filteredInstances.length > 0 && !selectedInstanceId) {
      if (targetInstance && filteredInstances.some(i => i.id === targetInstance.id)) {
          setSelectedInstanceId(targetInstance.id);
      } else {
          setSelectedInstanceId(filteredInstances[0].id);
      }
    } else if (filteredInstances.length === 0 && selectedInstanceId) {
      setSelectedInstanceId(''); // Clear selection if no compatible instances
    }
  }, [filteredInstances, selectedInstanceId, targetInstance]);

  const selectedInstance = useMemo(() => {
    return filteredInstances.find(i => i.id === selectedInstanceId) || null;
  }, [filteredInstances, selectedInstanceId]);

  if (!isOpen) return null;

  const handleInstall = async () => {
    if (!selectedInstanceId) return;
    setIsInstalling(true);
    try {
      await instanceApi.downloadMod({
        url: fileUrl,
        filename: fileName,
        instanceId: selectedInstanceId,
        projectId,
        versionId,
        environment,
        source,
        modName: modTitle
      });
      useToastStore.getState().addToast({
        message: t('mod_details.download_started', `Started downloading ${fileName} for ${selectedInstance?.name || 'instance'}`),
        type: 'success'
      });
      onClose();
    } catch (err: any) {
      useToastStore.getState().addToast({
        message: t('common.error', 'Error: ') + (err.message || 'Failed to download'),
        type: 'error'
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-lg rounded-2xl shadow-2xl border border-border flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surfaceHover/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <Download className="w-5 h-5 text-accent" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-primary truncate">
                {t('mod_install.title', 'Install Mod')}
              </h2>
              <p className="text-xs text-secondary truncate font-medium">
                {modTitle} {versionName && `• ${versionName}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-secondary hover:text-primary hover:bg-surface transition-colors outline-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">
            {t('mod_install.select_instance', 'Select Target Instance')}
          </label>

          {filteredInstances.length === 0 ? (
            <div className="p-8 text-center bg-background rounded-xl border border-border/50 text-secondary text-sm">
              {instances.length === 0 
                ? t('instance.noInstances', 'No instances found. Please create an instance first.')
                : t('mod_install.no_compatible_instances', 'No compatible instances found for this mod version. Please create a compatible instance.')}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredInstances.map((inst) => {
                const isSelected = inst.id === selectedInstanceId;

                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInstanceId(inst.id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                      isSelected
                        ? "border-accent bg-accent/10 shadow-sm"
                        : "border-border bg-surfaceHover/30 hover:border-border/80 hover:bg-surfaceHover/60"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center border border-border/50 shrink-0 overflow-hidden font-bold text-sm">
                        {inst.iconBase64 ? (
                          <img src={inst.iconBase64} alt={inst.name} className="w-full h-full object-cover" />
                        ) : (
                          <Layers className="w-4 h-4 text-secondary" />
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-primary truncate">{inst.name}</span>
                        <div className="flex items-center gap-1.5 text-xs text-secondary mt-0.5">
                          <span>{inst.minecraftVersion}</span>
                          <span>•</span>
                          <span className="capitalize">{inst.loaderType}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-1 text-[11px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-md border border-green-500/20">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        {t('mod_install.compatible', 'Compatible')}
                      </span>

                      <div className={cn(
                        "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                        isSelected ? "bg-accent border-accent text-white" : "border-border text-transparent"
                      )}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* File info notice */}
          <div className="bg-background/80 border border-border/60 rounded-xl p-3 text-xs text-secondary flex items-center justify-between">
            <span className="font-mono truncate">{fileName}</span>
            <span className="capitalize font-semibold text-primary shrink-0 ml-2">
              {selectedInstance?.storageMode || 'Isolated'} Mode
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surfaceHover/30 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} disabled={isInstalling}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleInstall}
            disabled={!selectedInstanceId || isInstalling || filteredInstances.length === 0}
            className="flex items-center gap-2 px-6"
          >
            <Download className="w-4 h-4" />
            {isInstalling ? t('common.downloading', 'Downloading...') : t('common.install', 'Install')}
          </Button>
        </div>
      </div>
    </div>
  );
}
