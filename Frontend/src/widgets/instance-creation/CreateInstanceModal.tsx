import { useState, useEffect, useMemo, useRef } from 'react';
import { X, Box, Layers, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/ui/Button';
import { SearchableSelect, SelectOption } from '@/shared/ui/SearchableSelect';
import { useVersionStore } from '@/entities/version/model/versionStore';
import { instanceApi } from '@/entities/instance/api/instanceApi';

interface CreateInstanceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type LoaderType = 'Vanilla' | 'Fabric' | 'Forge' | 'NeoForge' | 'Quilt' | 'LiteLoader';

export function CreateInstanceModal({ isOpen, onClose }: CreateInstanceModalProps) {
  const { t } = useTranslation();

  const [name, setName] = useState('');
  const [loaderType, setLoaderType] = useState<LoaderType>('Vanilla');
  const [mcVersion, setMcVersion] = useState('');
  const [loaderVersion, setLoaderVersion] = useState('');
  const [showSnapshots, setShowSnapshots] = useState(false);
  const [customLogo, setCustomLogo] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    vanillaVersions, fabricLoaders, forgeLoaders, forgeSupportedVersions, neoForgeLoaders, quiltLoaders, liteLoaderLoaders,
    isLoadingVanilla, isLoadingFabric, isLoadingForge, isLoadingForgeSupported, isLoadingNeoForge, isLoadingQuilt, isLoadingLiteLoader,
    fetchVanilla, fetchFabric, fetchForge, fetchForgeSupportedVersions, fetchNeoForge, fetchQuilt, fetchLiteLoader
  } = useVersionStore();

  useEffect(() => {
    if (isOpen) {
      fetchVanilla();
      fetchFabric();
      fetchQuilt();
      fetchForgeSupportedVersions();
    }
  }, [isOpen, fetchVanilla, fetchFabric, fetchQuilt, fetchForgeSupportedVersions]);

  useEffect(() => {
    if (mcVersion && loaderType === 'Forge') {
      fetchForge(mcVersion);
    }
    if (mcVersion && loaderType === 'NeoForge') {
      fetchNeoForge(mcVersion);
    }
    if (mcVersion && loaderType === 'LiteLoader') {
      fetchLiteLoader(mcVersion);
    }
  }, [mcVersion, loaderType, fetchForge, fetchNeoForge, fetchLiteLoader]);

  const mcVersionOptions: SelectOption[] = useMemo(() => {
    let filtered = vanillaVersions.filter(v => showSnapshots ? true : v.type === 'release');

    // Filter by loader support
    if (loaderType === 'LiteLoader') {
      const supported = ['1.12.2', '1.12.1', '1.12', '1.11.2', '1.11', '1.10.2', '1.10', '1.9.4', '1.9', '1.8.9', '1.8', '1.7.10', '1.7.2', '1.6.4', '1.6.2', '1.5.2'];
      filtered = filtered.filter(v => supported.includes(v.id));
    } else if (loaderType === 'NeoForge') {
      filtered = filtered.filter(v => v.type === 'release' && (v.id.startsWith('1.20') || v.id.startsWith('1.21') || v.id.startsWith('1.22')));
    } else if (loaderType === 'Forge') {
      filtered = filtered.filter(v => {
        if (forgeSupportedVersions && forgeSupportedVersions.length > 0) {
          return forgeSupportedVersions.includes(v.id);
        }
        return v.type === 'release' && !v.id.startsWith('26.3');
      });
    } else if (loaderType === 'Quilt') {
      filtered = filtered.filter(v => {
        const parts = v.id.split('.');
        if (parts.length >= 2) {
          const minor = parseInt(parts[1]);
          return minor >= 14;
        }
        return false;
      });
    }

    return filtered.map(v => ({
        value: v.id,
        label: v.id,
        badge: v.type === 'snapshot' ? 'Snap' : undefined
      }));
  }, [vanillaVersions, showSnapshots, loaderType, forgeSupportedVersions]);

  // When loader type changes or options change, force reset to first supported version if current is not in options
  useEffect(() => {
    if (mcVersionOptions.length > 0) {
      const isCurrentSupported = mcVersionOptions.some(o => o.value === mcVersion);
      if (!isCurrentSupported) {
        const latestRelease = mcVersionOptions.find(o => !o.badge) || mcVersionOptions[0];
        setMcVersion(latestRelease.value);
      }
    }
  }, [loaderType, mcVersionOptions]);

  const loaderOptions: SelectOption[] = useMemo(() => {
    if (loaderType === 'Fabric') {
      return fabricLoaders.map(v => ({ value: v, label: v }));
    }
    if (loaderType === 'Quilt') {
      return quiltLoaders.map(v => ({ value: v, label: v }));
    }
    if (loaderType === 'Forge' && mcVersion) {
      const versions = forgeLoaders[mcVersion] || [];
      return versions.map(v => ({ value: v, label: v }));
    }
    if (loaderType === 'NeoForge' && mcVersion) {
      const versions = neoForgeLoaders[mcVersion] || [];
      return versions.map(v => ({ value: v, label: v }));
    }
    if (loaderType === 'LiteLoader' && mcVersion) {
      const versions = liteLoaderLoaders[mcVersion] || [];
      return versions.map(v => ({ value: v, label: v }));
    }
    return [];
  }, [loaderType, mcVersion, fabricLoaders, forgeLoaders, neoForgeLoaders, quiltLoaders, liteLoaderLoaders]);

  useEffect(() => {
    if (mcVersionOptions.length > 0 && !mcVersion) {
      const latestRelease = mcVersionOptions.find(o => !o.badge);
      if (latestRelease) setMcVersion(latestRelease.value);
    }
  }, [mcVersionOptions, mcVersion]);

  useEffect(() => {
    setLoaderVersion(''); // Force reset on change
  }, [mcVersion, loaderType]);

  useEffect(() => {
    if (loaderOptions.length > 0 && !loaderVersion) {
      setLoaderVersion(loaderOptions[0].value);
    } else if (loaderOptions.length > 0 && loaderVersion && !loaderOptions.find(o => o.value === loaderVersion)) {
      setLoaderVersion(loaderOptions[0].value);
    }
  }, [loaderOptions, loaderVersion]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setCustomLogo(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  if (!isOpen) return null;

  const handleCreate = async () => {
    try {
      await instanceApi.createInstance({
        name,
        minecraftVersion: mcVersion,
        loaderType,
        loaderVersion,
        iconBase64: customLogo
      });
      onClose();
    } catch (e: any) {
      alert("Error: " + e.message);
    }
  };

  const isFormValid = name.trim().length > 0 && mcVersion && (loaderType === 'Vanilla' || loaderType === 'NeoForge' || loaderType === 'Quilt' || loaderType === 'LiteLoader' || loaderVersion);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface w-full max-w-2xl rounded-2xl shadow-2xl border border-border flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surfaceHover/30 rounded-t-2xl">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center border border-accent/20">
              <Box className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-primary">{t('instance.createTitle', 'Create Instance')}</h2>
              <p className="text-xs text-secondary">{t('instance.createDesc', 'Configure new environment')}</p>
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
        <div className="p-5 flex flex-col gap-5">
          {/* Name & Icon */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-secondary">{t('instance.nameLabel', 'Instance name')}</label>
            <div className="flex gap-4">
              <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleLogoChange} />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-12 h-12 rounded-xl bg-surfaceHover border border-border flex items-center justify-center text-primary font-bold text-xl cursor-pointer hover:border-accent transition-colors shrink-0 overflow-hidden relative group outline-none"
              >
                {customLogo ? (
                  <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  name ? name.charAt(0).toUpperCase() : '?'
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ImageIcon className="w-5 h-5 text-white" />
                </div>
              </button>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('instance.namePlaceholder', 'Conduit Instance...')}
                className="flex-1 bg-surfaceHover border border-border rounded-xl px-4 py-2 text-primary outline-none focus:border-accent transition-colors text-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="w-full h-px bg-border/50" />

          {/* Loader Type */}
          <div className="flex flex-col gap-2.5">
            <label className="text-sm font-semibold text-secondary">{t('instance.loaderLabel', 'Loader type')}</label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 w-full">
              {(['Vanilla', 'Fabric', 'Forge', 'NeoForge', 'Quilt', 'LiteLoader'] as LoaderType[]).map((type) => (
                <button
                  key={type}
                  onClick={() => setLoaderType(type)}
                  className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-1.5 rounded-xl border-2 transition-all outline-none w-full
                    ${loaderType === type 
                      ? 'border-accent bg-accent/5 text-accent shadow-sm' 
                      : 'border-border bg-surfaceHover/50 text-secondary hover:border-accent/50 hover:bg-surfaceHover'}
                  `}
                >
                  <Layers className="w-4 h-4 shrink-0" />
                  <span className="font-semibold text-xs truncate w-full text-center">{type}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Versions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between h-7">
                <label className="text-sm font-semibold text-secondary">{t('instance.gameVersion', 'Game version')}</label>
                <div className="flex items-center gap-2">
                  <button 
                    type="button"
                    role="switch"
                    aria-checked={showSnapshots}
                    onClick={() => setShowSnapshots(!showSnapshots)}
                    className={`relative inline-flex h-4 w-7 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface ${showSnapshots ? 'bg-brand' : 'bg-surfaceHover border-border'}`}
                  >
                    <span className={`pointer-events-none inline-block h-3 w-3 transform rounded-full transition-transform ${showSnapshots ? 'translate-x-3 bg-background' : 'translate-x-0 bg-secondary'}`} />
                  </button>
                  <span className="text-xs text-secondary font-medium">{t('instance.snapshots', 'Snapshots')}</span>
                </div>
              </div>
              <SearchableSelect 
                options={mcVersionOptions}
                value={mcVersion}
                onChange={setMcVersion}
                loading={isLoadingVanilla || (loaderType === 'Forge' && isLoadingForgeSupported)}
                placeholder={t('instance.selectVersion', 'Select version...')}
              />
            </div>

            {loaderType !== 'Vanilla' && (() => {
              const latestVal = loaderOptions[0]?.value;
              const stableVal = loaderOptions.find(o => !o.value.toLowerCase().includes('beta') && !o.value.toLowerCase().includes('alpha') && !o.value.toLowerCase().includes('pre'))?.value || latestVal;
              
              return (
                <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-left-4 duration-200">
                  <div className="flex items-center justify-between h-7">
                    <label className="text-sm font-semibold text-secondary">{t('instance.loaderVersion', 'Version')} {loaderType}</label>
                    <div className="flex gap-1 ml-auto">
                      <button 
                        onClick={() => setLoaderVersion(stableVal)}
                        disabled={!stableVal}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${loaderVersion === stableVal ? 'bg-brand/20 border border-brand/50 text-brand' : 'text-secondary border border-transparent hover:border-border hover:bg-surfaceHover/50 hover:text-primary'} ${!stableVal && 'opacity-50 cursor-not-allowed'}`}
                        type="button"
                      >
                        {t('instance.stable', 'Stable')}
                      </button>
                      <button 
                        onClick={() => setLoaderVersion(latestVal)}
                        disabled={!latestVal}
                        className={`px-2 py-1 text-[10px] font-semibold rounded-md transition-colors ${loaderVersion === latestVal ? 'bg-brand/20 border border-brand/50 text-brand' : 'text-secondary border border-transparent hover:border-border hover:bg-surfaceHover/50 hover:text-primary'}`}
                        type="button"
                      >
                        {t('instance.latest', 'Latest')}
                      </button>
                    </div>
                  </div>
                  <SearchableSelect 
                    options={loaderOptions}
                    value={loaderVersion}
                    onChange={setLoaderVersion}
                    loading={
                      loaderType === 'Fabric' ? isLoadingFabric :
                      loaderType === 'Quilt' ? isLoadingQuilt :
                      (loaderType === 'Forge' && mcVersion) ? isLoadingForge[mcVersion] :
                      (loaderType === 'NeoForge' && mcVersion) ? isLoadingNeoForge[mcVersion] :
                      (loaderType === 'LiteLoader' && mcVersion) ? isLoadingLiteLoader[mcVersion] :
                      false
                    }
                    placeholder={t('instance.selectLoaderVersion', 'Select version...')}
                    disabled={!mcVersion}
                  />
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border bg-surfaceHover/30 flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose} className="px-6">{t('common.cancel', 'Cancel')}</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!isFormValid} className="px-8">
            {t('common.create', 'Create')}
          </Button>
        </div>
      </div>
    </div>
  );
}
