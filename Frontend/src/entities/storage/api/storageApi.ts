import { invoke } from '@/shared/ipc/ipcClient';
import { StorageMetrics } from '../model/types';

export const storageApi = {
    getMetrics: (): Promise<StorageMetrics> => invoke<StorageMetrics>('GET_STORAGE_METRICS')
};
            
            
    