import { invoke } from '@/shared/ipc/ipcClient';

export const launchApi = {
    launch: (instanceId: string) => invoke<string>('LAUNCH', { instanceId }),
    killProcess: () => invoke<string>('KILL_PROCESS')
};
            
    