import { create } from 'zustand';
import { storageApi } from '../api/storageApi';
import { StorageMetrics } from './types';

interface StorageState {
    metrics: StorageMetrics | null;
    isLoading: boolean;
    fetchMetrics: () => Promise<void>;
}

export const useStorageStore = create<StorageState>((set) => ({
    metrics: null,
    isLoading: false,

    fetchMetrics: async () => {
        set({ isLoading: true });
        try {
            const data = await storageApi.getMetrics();
            set({ metrics: data });
        } catch (e) {
            console.error("[Storage] Failed to fetch metrics", e);
        } finally {
            set({ isLoading: false });
        }
    }
}));
    