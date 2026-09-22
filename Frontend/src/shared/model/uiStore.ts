import { create } from 'zustand';

interface UiState {
    isSettingsOpen: boolean;
    setSettingsOpen: (isOpen: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
    isSettingsOpen: false,
    setSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen })
}));
    