import { invoke } from '@/shared/ipc/ipcClient';

export interface LauncherPrefsPayload {
    theme: string;
    language: string;
    uiScale: number;
    fontFamily: string;
    useSystemBrowser: boolean;
    debugMarkdown: boolean;
    enableNetworkTrace: boolean;
    maxConcurrentDownloads: number;
    activeAccountId?: string;
}

export const prefsApi = {
    getPrefs: () => invoke<LauncherPrefsPayload>('GET_PREFS'),
    savePrefs: (prefs: Partial<LauncherPrefsPayload>) => invoke<void>('SAVE_PREFS', prefs),
    openUrl: (url: string) => invoke<void>('OPEN_URL', url)
};
            
    