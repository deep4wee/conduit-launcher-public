import { invoke } from '@/shared/ipc/ipcClient';

export interface AccountProfile {
  id: string;
  username: string;
  type: 'Offline' | 'Microsoft' | 'Modrinth';
  hasToken: boolean;
  skinUrl?: string;
}

export const accountApi = {
  getAccounts: (): Promise<AccountProfile[]> => {
    return invoke<AccountProfile[]>('GET_ACCOUNTS');
  },
  
  addOfflineAccount: (username: string): Promise<string> => {
    return invoke<string>('ADD_OFFLINE_ACCOUNT', { username });
  },

  addMicrosoftAccount: (): Promise<string> => {
    return invoke<string>('ADD_MICROSOFT_ACCOUNT');
  },

  addModrinthAccount: (username: string, apiKey: string): Promise<string> => {
    return invoke<string>('ADD_MODRINTH_ACCOUNT', { username, apiKey });
  },

  setActiveAccount: (accountId: string): Promise<void> => {
    return invoke<void>('SET_ACTIVE_ACCOUNT', { accountId });
  },

  deleteAccount: (accountId: string): Promise<void> => {
    return invoke<void>('DELETE_ACCOUNT', { accountId });
  }
};
