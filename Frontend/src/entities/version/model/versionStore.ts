import { create } from 'zustand';
import { versionApi, GameVersionDto } from '../api/versionApi';
import { useToastStore } from '@/shared/ui/Toast';

interface VersionState {
  vanillaVersions: GameVersionDto[];
  fabricLoaders: string[];
  forgeLoaders: Record<string, string[]>;
  forgeSupportedVersions: string[];
  neoForgeLoaders: Record<string, string[]>;
  quiltLoaders: string[];
  liteLoaderLoaders: Record<string, string[]>;
  
  isLoadingVanilla: boolean;
  isLoadingFabric: boolean;
  isLoadingForge: Record<string, boolean>;
  isLoadingForgeSupported: boolean;
  isLoadingNeoForge: Record<string, boolean>;
  isLoadingQuilt: boolean;
  isLoadingLiteLoader: Record<string, boolean>;
  
  error: string | null;

  fetchVanilla: () => Promise<void>;
  fetchFabric: () => Promise<void>;
  fetchForge: (mcVersion: string) => Promise<void>;
  fetchForgeSupportedVersions: () => Promise<void>;
  fetchNeoForge: (mcVersion: string) => Promise<void>;
  fetchQuilt: () => Promise<void>;
  fetchLiteLoader: (mcVersion: string) => Promise<void>;
}

export const useVersionStore = create<VersionState>((set, get) => ({
  vanillaVersions: [],
  fabricLoaders: [],
  forgeLoaders: {},
  forgeSupportedVersions: [],
  neoForgeLoaders: {},
  quiltLoaders: [],
  liteLoaderLoaders: {},
  
  isLoadingVanilla: false,
  isLoadingFabric: false,
  isLoadingForge: {},
  isLoadingForgeSupported: false,
  isLoadingNeoForge: {},
  isLoadingQuilt: false,
  isLoadingLiteLoader: {},
  
  error: null,

  fetchVanilla: async () => {
    if (get().vanillaVersions.length > 0) return;
    set({ isLoadingVanilla: true, error: null });
    try {
      const versions = await versionApi.getVanillaVersions();
      set({ vanillaVersions: versions || [], isLoadingVanilla: false });
    } catch (err: any) {
      console.error('Vanilla versions error:', err);
      useToastStore.getState().addToast({ type: 'error', message: 'Failed to load Minecraft versions' });
      set({ error: err.message, isLoadingVanilla: false });
    }
  },

  fetchFabric: async () => {
    if (get().fabricLoaders.length > 0) return;
    set({ isLoadingFabric: true, error: null });
    try {
      const loaders = await versionApi.getFabricLoaders();
      set({ fabricLoaders: loaders || [], isLoadingFabric: false });
    } catch (err: any) {
      console.error('Fabric versions error:', err);
      set({ error: err.message, isLoadingFabric: false });
    }
  },

  fetchForge: async (mcVersion: string) => {
    if (get().forgeLoaders[mcVersion] && get().forgeLoaders[mcVersion].length > 0) return;
    set((state) => ({ isLoadingForge: { ...state.isLoadingForge, [mcVersion]: true }, error: null }));
    try {
      const loaders = await versionApi.getForgeLoaders(mcVersion);
      set((state) => ({ 
        forgeLoaders: { ...state.forgeLoaders, [mcVersion]: loaders || [] },
        isLoadingForge: { ...state.isLoadingForge, [mcVersion]: false }
      }));
    } catch (err: any) {
      console.error('Forge versions error:', err);
      set((state) => ({ 
        error: err.message, 
        isLoadingForge: { ...state.isLoadingForge, [mcVersion]: false } 
      }));
    }
  },

  fetchForgeSupportedVersions: async () => {
    if (get().forgeSupportedVersions.length > 0) return;
    set({ isLoadingForgeSupported: true, error: null });
    try {
      const versions = await versionApi.getForgeSupportedVersions();
      set({ forgeSupportedVersions: versions || [], isLoadingForgeSupported: false });
    } catch (err: any) {
      console.error('Forge supported versions error:', err);
      set({ error: err.message, isLoadingForgeSupported: false });
    }
  },

  fetchNeoForge: async (mcVersion: string) => {
    if (get().neoForgeLoaders[mcVersion] && get().neoForgeLoaders[mcVersion].length > 0) return;
    set((state) => ({ isLoadingNeoForge: { ...state.isLoadingNeoForge, [mcVersion]: true }, error: null }));
    try {
      const loaders = await versionApi.getNeoForgeLoaders(mcVersion);
      set((state) => ({ 
        neoForgeLoaders: { ...state.neoForgeLoaders, [mcVersion]: loaders || [] },
        isLoadingNeoForge: { ...state.isLoadingNeoForge, [mcVersion]: false }
      }));
    } catch (err: any) {
      console.error('NeoForge versions error:', err);
      set((state) => ({ 
        error: err.message, 
        isLoadingNeoForge: { ...state.isLoadingNeoForge, [mcVersion]: false } 
      }));
    }
  },

  fetchQuilt: async () => {
    if (get().quiltLoaders.length > 0) return;
    set({ isLoadingQuilt: true, error: null });
    try {
      const loaders = await versionApi.getQuiltLoaders();
      set({ quiltLoaders: loaders || [], isLoadingQuilt: false });
    } catch (err: any) {
      console.error('Quilt versions error:', err);
      set({ error: err.message, isLoadingQuilt: false });
    }
  },

  fetchLiteLoader: async (mcVersion: string) => {
    if (get().liteLoaderLoaders[mcVersion] && get().liteLoaderLoaders[mcVersion].length > 0) return;
    set((state) => ({ isLoadingLiteLoader: { ...state.isLoadingLiteLoader, [mcVersion]: true }, error: null }));
    try {
      const loaders = await versionApi.getLiteLoaderLoaders(mcVersion);
      set((state) => ({ 
        liteLoaderLoaders: { ...state.liteLoaderLoaders, [mcVersion]: loaders || [] },
        isLoadingLiteLoader: { ...state.isLoadingLiteLoader, [mcVersion]: false }
      }));
    } catch (err: any) {
      console.error('LiteLoader versions error:', err);
      set((state) => ({ 
        error: err.message, 
        isLoadingLiteLoader: { ...state.isLoadingLiteLoader, [mcVersion]: false } 
      }));
    }
  }
}));
