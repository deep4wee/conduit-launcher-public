import { create } from 'zustand';
import { instanceApi, InstanceDto } from '../api/instanceApi';

interface InstanceState {
  instances: InstanceDto[];
  isLoading: boolean;
  error: string | null;
  launchingInstances: Record<string, boolean>;
  fetchInstances: () => Promise<void>;
  deleteInstance: (id: string) => Promise<void>;
  renameInstance: (id: string, newName: string) => Promise<void>;
  openFolder: (id: string) => Promise<void>;
  launchInstance: (id: string) => Promise<void>;
}

export const useInstanceStore = create<InstanceState>((set, get) => ({
  instances: [],
  isLoading: false,
  error: null,
  launchingInstances: {},
  fetchInstances: async () => {
    set({ isLoading: true, error: null });
    try {
      const instances = await instanceApi.getInstances();
      set({ instances, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Error', isLoading: false });
    }
  },
  deleteInstance: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await instanceApi.deleteInstance(id);
      const instances = await instanceApi.getInstances();
      set({ instances, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Error', isLoading: false });
    }
  },
  renameInstance: async (id: string, newName: string) => {
    set({ isLoading: true, error: null });
    try {
      await instanceApi.renameInstance(id, newName);
      const instances = await instanceApi.getInstances();
      set({ instances, isLoading: false });
    } catch (e: any) {
      set({ error: e.message || 'Error', isLoading: false });
    }
  },
  openFolder: async (id: string) => {
    try {
      await instanceApi.openInstanceFolder(id);
    } catch (e: any) {
      set({ error: e.message || 'Error' });
    }
  },
  launchInstance: async (id: string) => {
    if (get().launchingInstances[id]) return; // prevent double click
    set((state) => ({ launchingInstances: { ...state.launchingInstances, [id]: true } }));
    try {
      await instanceApi.launchInstance(id);
    } catch (e: any) {
      set({ error: e.message || 'Error' });
    } finally {
      set((state) => ({ launchingInstances: { ...state.launchingInstances, [id]: false } }));
    }
  }
}));
