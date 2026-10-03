import { create } from 'zustand';
import { accountApi, AccountProfile } from '../api/accountApi';
import { useToastStore } from '@/shared/ui/Toast';

interface AccountState {
  accounts: AccountProfile[];
  activeAccountId: string | null;
  isLoading: boolean;
  error: string | null;
  loadAccounts: () => Promise<void>;
  addOfflineAccount: (username: string) => Promise<void>;
  addMicrosoftAccount: () => Promise<void>;
  addModrinthAccount: (username: string, apiKey: string) => Promise<void>;
  setActiveAccount: (accountId: string) => Promise<void>;
  deleteAccount: (accountId: string) => Promise<void>;
}

export const useAccountStore = create<AccountState>((set, get) => ({
  accounts: [],
  activeAccountId: null,
  isLoading: false,
  error: null,
  
  loadAccounts: async () => {
    set({ isLoading: true, error: null });
    try {
      const accounts = await accountApi.getAccounts();
      const activeAccount = accounts.find((a) => a.isActive);
      const activeId = activeAccount ? activeAccount.id : (accounts.length > 0 ? accounts[0].id : null);
      set({ accounts, activeAccountId: activeId, isLoading: false });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load accounts';
      set({ error: message, isLoading: false });
    }
  },

  addOfflineAccount: async (username: string) => {
    set({ isLoading: true, error: null });
    try {
      await accountApi.addOfflineAccount(username);
      await get().loadAccounts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add account';
      set({ error: msg, isLoading: false });
    }
  },

  addMicrosoftAccount: async () => {
    set({ isLoading: true, error: null });
    try {
      await accountApi.addMicrosoftAccount();
      await get().loadAccounts();
      set({ isLoading: false });
      useToastStore.getState().addToast({ message: "Microsoft account added successfully!", type: 'success' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add Microsoft account';
      set({ error: msg, isLoading: false });
      useToastStore.getState().addToast({ message: msg, type: 'error' });
    }
  },

  addModrinthAccount: async (username: string, apiKey: string) => {
    set({ isLoading: true, error: null });
    try {
      await accountApi.addModrinthAccount(username, apiKey);
      await get().loadAccounts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add Modrinth account';
      set({ error: msg, isLoading: false });
    }
  },
  
  setActiveAccount: async (accountId: string) => {
    set({ isLoading: true, error: null });
    try {
      await accountApi.setActiveAccount(accountId);
      set({ activeAccountId: accountId, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to set active account';
      set({ error: msg, isLoading: false });
    }
  },

  deleteAccount: async (accountId: string) => {
    set({ isLoading: true, error: null });
    try {
      await accountApi.deleteAccount(accountId);
      await get().loadAccounts();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account';
      set({ error: msg, isLoading: false });
    }
  }
}));
