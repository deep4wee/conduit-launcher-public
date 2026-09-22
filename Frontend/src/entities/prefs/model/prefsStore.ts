import { create } from 'zustand';
import { prefsApi } from '../api/prefsApi';
import i18n from '@/shared/i18n/i18n';

type Theme = 'light' | 'dark' | 'oled' | 'dracula' | 'nord';
type Language = 'en' | 'uk';
type FontFamily = 'inter' | 'poppins' | 'jetbrains' | 'system';

interface PrefsState {
    theme: Theme;
    language: Language;
    uiScale: number;
    fontFamily: FontFamily;
    useSystemBrowser: boolean;
    debugMarkdown: boolean;
    enableNetworkTrace: boolean;
    maxConcurrentDownloads: number;

    initPrefs: () => Promise<void>;

    setTheme: (theme: Theme) => void;
    setLanguage: (lang: Language) => void;
    setUiScale: (scale: number) => void;
    setFontFamily: (font: FontFamily) => void;
    setUseSystemBrowser: (use: boolean) => void;
    setDebugMarkdown: (val: boolean) => void;
    setEnableNetworkTrace: (val: boolean) => void;
    setMaxConcurrentDownloads: (val: number) => void;
    openExternalUrl: (url: string) => void;
}


export const usePrefsStore = create<PrefsState>((set, get) => ({
    theme: 'dark',
    language: 'uk',
    uiScale: 1.0,
    fontFamily: 'inter',
    useSystemBrowser: true,
    debugMarkdown: false,
    enableNetworkTrace: false,
    maxConcurrentDownloads: 10,

    initPrefs: async () => {
        try {
            const prefs = await prefsApi.getPrefs();
            if (prefs) {
                const theme = (prefs.theme ?? 'dark') as Theme;
                const language = (prefs.language ?? 'uk') as Language;
                const uiScale = (prefs.uiScale ?? 1.0) as number;
                const fontFamily = (prefs.fontFamily ?? 'inter') as FontFamily;
                const useSystemBrowser = (prefs.useSystemBrowser ?? true) as boolean;
                const debugMarkdown = (prefs.debugMarkdown ?? false) as boolean;
                const enableNetworkTrace = (prefs.enableNetworkTrace ?? false) as boolean;
                const maxConcurrentDownloads = (prefs.maxConcurrentDownloads ?? 10) as number;

                set({
                    theme,
                    language,
                    uiScale,
                    fontFamily,
                    useSystemBrowser,
                    debugMarkdown,
                    enableNetworkTrace,
                    maxConcurrentDownloads
                });
                i18n.changeLanguage(language);
            }
        } catch (e) {
            console.error("[Store] Failed to init preferences", e);
        }
    },


    setTheme: (theme) => {
        set({ theme });
        prefsApi.savePrefs({ ...get(), theme });
    },

    setLanguage: (language) => {
        set({ language });
        i18n.changeLanguage(language);
        prefsApi.savePrefs({ ...get(), language });
    },

    setUiScale: (uiScale) => {
        set({ uiScale });
        prefsApi.savePrefs({ ...get(), uiScale });
    },

    setFontFamily: (fontFamily) => {
        set({ fontFamily });
        prefsApi.savePrefs({ ...get(), fontFamily });
    },

    setUseSystemBrowser: (useSystemBrowser) => {
        set({ useSystemBrowser });
        prefsApi.savePrefs({ ...get(), useSystemBrowser });
    },

    setDebugMarkdown: (debugMarkdown) => {
        set({ debugMarkdown });
        prefsApi.savePrefs({ ...get(), debugMarkdown });
    },

    setEnableNetworkTrace: (enableNetworkTrace) => {
        set({ enableNetworkTrace });
        prefsApi.savePrefs({ ...get(), enableNetworkTrace });
    },

    setMaxConcurrentDownloads: (maxConcurrentDownloads) => {
        set({ maxConcurrentDownloads });
        prefsApi.savePrefs({ ...get(), maxConcurrentDownloads });
    },

    openExternalUrl: (url: string) => {

        if (get().useSystemBrowser) {
            prefsApi.openUrl(url);
        } else {
            window.open(url, '_blank', 'width=1200,height=800');
        }
    }
}));
