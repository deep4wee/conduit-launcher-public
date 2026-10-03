import { useState, useEffect, useMemo } from 'react';
import { X, Download, AlertTriangle, Loader2, Package, Layers } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { useInstanceStore, instanceApi, DependencyPlan } from '@/entities/instance';
import { useToastStore } from '@/shared/ui/Toast';
import { InstanceSelectCard } from './InstanceSelectCard';
import { formatBytes } from '@/shared/lib/helpers/formatBytes';

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
  iconUrl?: string;
  targetInstanceId?: string | null;
}

type Step = 'SELECT_INSTANCE' | 'PREFLIGHT' | 'RESULT';

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
  source = 'Modrinth',
  targetInstanceId = null
}: InstallModModalProps) {
  const { t } = useTranslation();
  const { instances, fetchInstances } = useInstanceStore();
  const [step, setStep] = useState<Step>('SELECT_INSTANCE');
  const [selectedInstanceId, setSelectedInstanceId] = useState<string>('');
  const [isInstalling, setIsInstalling] = useState(false);
  const [plan, setPlan] = useState<DependencyPlan | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchInstances();
      setStep('SELECT_INSTANCE');
      setPlan(null);
      setIsInstalling(false);
      if (targetInstanceId) {
        setSelectedInstanceId(targetInstanceId);
      }
    }
  }, [isOpen, targetInstanceId, fetchInstances]);

  const filteredInstances = useMemo(() => {
    return instances.filter(inst => {
      const matchVer = gameVersions.length === 0 || gameVersions.includes(inst.minecraftVersion);
      const matchLoader = loaders.length === 0 || loaders.map(l => l.toLowerCase()).includes(inst.loaderType.toLowerCase());
      return matchVer && matchLoader;
    });
  }, [instances, gameVersions, loaders]);

  useEffect(() => {
    if (filteredInstances.length > 0 && !selectedInstanceId) {
      if (targetInstanceId && filteredInstances.some(i => i.id === targetInstanceId)) {
          setSelectedInstanceId(targetInstanceId);
      } else {
          setSelectedInstanceId(filteredInstances[0].id);
      }
    } else if (filteredInstances.length === 0 && selectedInstanceId) {
      setSelectedInstanceId('');
    }
  }, [filteredInstances, selectedInstanceId, targetInstanceId]);

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step === 'SELECT_INSTANCE') {
      if (!selectedInstanceId) return;
      if (!projectId || !versionId) {
        // Fallback for non-modrinth mods or rough installs
        setIsInstalling(true);
        try {
          await instanceApi.downloadMod({
            url: fileUrl, filename: fileName, instanceId: selectedInstanceId, modName: modTitle
          });
          useToastStore.getState().addToast({ message: t('mod_install.success', 'Installed successfully'), type: 'success' });
          onClose();
        } catch (err: unknown) {
          useToastStore.getState().addToast({ message: t('common.error', 'Error: ') + String(err), type: 'error' });
        } finally {
          setIsInstalling(false);
        }
        return;
      }

      setStep('PREFLIGHT');
      try {
        const p = await instanceApi.preflightModInstall(selectedInstanceId, projectId, versionId, source);
        setPlan(p);
        setStep('RESULT');
      } catch (err: unknown) {
        useToastStore.getState().addToast({ message: String(err), type: 'error' });
        setStep('SELECT_INSTANCE');
      }
    } else if (step === 'RESULT' && plan) {
      if (plan.status === 1) return; // Cannot install with conflicts
      setIsInstalling(true);
      try {
        await instanceApi.confirmModInstall(selectedInstanceId, plan);
        useToastStore.getState().addToast({ message: t('mod_install.success', 'Mod and dependencies installed!'), type: 'success' });
        onClose();
      } catch (err: unknown) {
        useToastStore.getState().addToast({ message: String(err), type: 'error' });
      } finally {
        setIsInstalling(false);
      }
    }
  };

  const renderContent = () => {
    if (step === 'SELECT_INSTANCE') {
      return (
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar p-5">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">
            {t('mod_install.select_instance', 'Select Target Instance')}
          </label>
          {filteredInstances.length === 0 ? (
            <div className="p-8 text-center bg-background rounded-xl border border-border/50 text-secondary text-sm">
              {instances.length === 0 
                ? t('instance.noInstances', 'No instances found. Please create an instance first.')
                : t('mod_install.no_compatible_instances', 'No compatible instances found for this mod version.')}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredInstances.map((inst) => (
                <InstanceSelectCard
                  key={inst.id}
                  instance={inst}
                  isSelected={inst.id === selectedInstanceId}
                  onSelect={() => setSelectedInstanceId(inst.id)}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (step === 'PREFLIGHT') {
      return (
        <div className="p-10 flex flex-col items-center justify-center gap-4 min-h-[300px]">
          <Loader2 className="w-10 h-10 text-accent animate-spin" />
          <p className="text-sm text-primary font-medium">{t('mod_install.analyzing', 'Analyzing dependencies and compatibility...')}</p>
        </div>
      );
    }

    if (step === 'RESULT' && plan) {
      if (plan.status === 1) { // Conflict
        return (
          <div className="p-5 flex flex-col gap-4">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold text-red-400">{t('mod_install.conflict_title', 'Incompatibility Detected')}</h3>
                {plan.conflicts.map((c, i) => (
                  <p key={i} className="text-xs text-red-400/80 leading-relaxed">{c.reason}</p>
                ))}
              </div>
            </div>
          </div>
        );
      }

      // Success / Ready to confirm
      return (
        <div className="flex flex-col max-h-[60vh] overflow-hidden">
          <div className="p-5 pb-3 border-b border-border bg-background">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary font-medium">{t('mod_install.files_to_download', 'Files to download:')} <strong className="text-primary">{plan.filesToDownload.length}</strong></span>
              <span className="text-secondary font-medium">{t('mod_install.total_size', 'Total size:')} <strong className="text-primary">{formatBytes(plan.totalBytesToDownload)}</strong></span>
            </div>
          </div>
          <div className="p-5 flex flex-col gap-2 overflow-y-auto custom-scrollbar">
            {plan.filesToDownload.map(f => (
              <div key={f.projectId} className="flex items-center gap-3 p-3 rounded-xl border border-border/60 bg-surfaceHover/30">
                {f.iconUrl ? (
                  <img src={f.iconUrl} alt={f.title} className="w-8 h-8 rounded-lg object-cover bg-surface shrink-0 border border-border/50" />
                ) : f.isDirectInstall ? (
                  <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/20 flex items-center justify-center shrink-0">
                    <Package className="w-4 h-4 text-accent" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-surface border border-border/50 flex items-center justify-center shrink-0">
                    <Layers className="w-4 h-4 text-secondary" />
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-bold text-primary truncate">{f.title || f.projectId}</span>
                  <span className="text-xs text-secondary truncate">
                    {f.isDirectInstall ? t('mod_install.main_mod', 'Main Mod') : t('mod_install.dependency', 'Dependency')}
                    {f.versionNumber && ` • v${f.versionNumber}`}
                    {` • ${formatBytes(f.sizeBytes)}`}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return null;
  };

  const isNextDisabled = 
    (step === 'SELECT_INSTANCE' && (!selectedInstanceId || filteredInstances.length === 0)) ||
    (step === 'PREFLIGHT') ||
    (step === 'RESULT' && plan?.status === 1) ||
    isInstalling;

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

        {/* Dynamic Content */}
        {renderContent()}

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surfaceHover/30 flex justify-end gap-3">
          <Button variant="secondary" onClick={step === 'RESULT' ? () => setStep('SELECT_INSTANCE') : onClose} disabled={isInstalling}>
            {step === 'RESULT' ? t('common.back', 'Back') : t('common.cancel', 'Cancel')}
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={isNextDisabled}
            className="flex items-center gap-2 px-6"
          >
            <Download className="w-4 h-4" />
            {isInstalling ? t('common.downloading', 'Завантаження...') : (step === 'RESULT' ? t('common.install', 'Встановити') : t('common.next', 'Далі'))}
          </Button>
        </div>
      </div>
    </div>
  );
}


