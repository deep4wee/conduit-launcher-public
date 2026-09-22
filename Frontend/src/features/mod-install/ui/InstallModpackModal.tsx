import { useState } from 'react';
import { X, Package, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { instanceApi } from '@/entities/instance';
import { useToastStore } from '@/shared/ui/Toast';

export interface InstallModpackModalProps {
  isOpen: boolean;
  onClose: () => void;
  modpackTitle: string;
  fileUrl: string;
}

export function InstallModpackModal({
  isOpen,
  onClose,
  modpackTitle,
  fileUrl
}: InstallModpackModalProps) {
  const { t } = useTranslation();
  const [instanceName, setInstanceName] = useState(modpackTitle);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const handleInstall = async () => {
    if (!instanceName.trim()) return;
    setIsInstalling(true);
    try {
      await instanceApi.installModpack(fileUrl, instanceName.trim());
      useToastStore.getState().addToast({
        message: t('modpack.started', `Modpack installation started for "${instanceName}". Check the Task Center!`),
        type: 'success'
      });
      onClose();
    } catch (err: any) {
      useToastStore.getState().addToast({
        message: err?.message || t('common.error', 'Failed to install modpack'),
        type: 'error'
      });
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border/80 bg-surface/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent">
              <Package className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <h2 className="text-base font-bold text-primary truncate">
                {t('modpack.installTitle', 'Install Modpack')}
              </h2>
              <p className="text-xs text-secondary truncate font-medium">
                {modpackTitle}
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
        <div className="p-5 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">
              {t('modpack.instanceName', 'Instance Name')}
            </label>
            <input 
              type="text"
              value={instanceName}
              onChange={(e) => setInstanceName(e.target.value)}
              placeholder="My Modpack Instance"
              className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-primary outline-none focus:border-accent transition-colors"
            />
            <span className="text-xs text-secondary">
              {t('modpack.instanceNameHint', 'A new game instance will be created with the loader and mods from this modpack.')}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-border/80 bg-surface/50">
          <Button variant="secondary" onClick={onClose} disabled={isInstalling}>
            {t('common.cancel', 'Cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleInstall} 
            disabled={!instanceName.trim() || isInstalling}
            className="flex items-center gap-2"
          >
            {isInstalling ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                {t('modpack.installing', 'Installing...')}
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                {t('modpack.install', 'Install')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
