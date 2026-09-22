import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAccountStore } from './accountStore';
import { accountApi } from '../api/accountApi';

describe('useAccountStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAccountStore.setState({
      accounts: [],
      isLoading: false,
      error: null
    });
    vi.clearAllMocks();
  });

  it('loadAccounts should populate accounts on success', async () => {
    const mockAccounts = [
      { id: '1', username: 'TestUser', type: 'Offline', hasToken: false }
    ];
    // @ts-ignore
    vi.spyOn(accountApi, 'getAccounts').mockResolvedValue(mockAccounts);

    const store = useAccountStore.getState();
    await store.loadAccounts();

    const state = useAccountStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.accounts).toEqual(mockAccounts);
  });

  it('loadAccounts should handle errors', async () => {
    vi.spyOn(accountApi, 'getAccounts').mockRejectedValue(new Error('Network error'));

    const store = useAccountStore.getState();
    await store.loadAccounts();

    const state = useAccountStore.getState();
    expect(state.isLoading).toBe(false);
    expect(state.accounts).toEqual([]);
    expect(state.error).toBe('Network error');
  });

  it('addOfflineAccount should call API and reload accounts', async () => {
    vi.spyOn(accountApi, 'addOfflineAccount').mockResolvedValue('new-id');
    const loadSpy = vi.spyOn(accountApi, 'getAccounts').mockResolvedValue([]);

    const store = useAccountStore.getState();
    await store.addOfflineAccount('NewUser');

    expect(accountApi.addOfflineAccount).toHaveBeenCalledWith('NewUser');
    expect(loadSpy).toHaveBeenCalled(); // Should reload
  });

  it('setActiveAccount should call API', async () => {
    vi.spyOn(accountApi, 'setActiveAccount').mockResolvedValue();

    const store = useAccountStore.getState();
    await store.setActiveAccount('account-1');

    expect(accountApi.setActiveAccount).toHaveBeenCalledWith('account-1');
  });
});
