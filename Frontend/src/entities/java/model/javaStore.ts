import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { javaApi } from '../api/javaApi';
import { JavaRuntime, JavaSettings } from './types';

interface JavaState {
    settings: JavaSettings;
    detectedRuntimes: JavaRuntime[];
    isDetecting: boolean;
    
    setJavaMapping: (major: 8 | 17 | 21, path: string) => void;
        detectAll: () => Promise<void>;
    browsePath: () => Promise<void>;
    testPath: (path: string) => Promise<JavaRuntime>;
    removeRuntime: (path: string) => void;
    installRecommended: (major: 8 | 17 | 21) => Promise<void>;
}

export const useJavaStore = create<JavaState>()(
            
    persist(
        (set, get) => ({
            settings: {
                defaultJava8: '',
                defaultJava17: '',
                defaultJava21: ''
            },
            detectedRuntimes: [],
            isDetecting: false,

            setJavaMapping: (major, path) => {
                set((state) => ({
                    settings: { ...state.settings, [`defaultJava${major}`]: path }
                }));
            },

            detectAll: async () => {
                set({ isDetecting: true });
                try {
                    const runtimes = await javaApi.detectJava();
                    
                    // Зливаємо нові з існуючими 
                    const existingPaths = new Set(get().detectedRuntimes.map(r => r.path));
                    const newRuntimes = runtimes.filter(r => !existingPaths.has(r.path));
                    
                    const updatedRuntimes = [...get().detectedRuntimes, ...newRuntimes];
                    set({ detectedRuntimes: updatedRuntimes });

                    // Авто-призначення, якщо ще не вибрано
                    const s = get().settings;
                    if (!s.defaultJava8) set({ settings: { ...get().settings, defaultJava8: updatedRuntimes.find(r => r.majorVersion === 8)?.path || '' }});
                    if (!s.defaultJava17) set({ settings: { ...get().settings, defaultJava17: updatedRuntimes.find(r => r.majorVersion === 17)?.path || '' }});
                    if (!s.defaultJava21) set({ settings: { ...get().settings, defaultJava21: updatedRuntimes.find(r => r.majorVersion >= 21)?.path || '' }});

                } catch (e) {
                    console.error("Failed to detect Java", e);
                } finally {
                    set({ isDetecting: false });
                }
            },

            browsePath: async () => {
                const path = await javaApi.browseFile();
                if (path) {
                    // Тестуємо вибраний файл
                    const result = await javaApi.testJava(path);
                    if (result.isValid) {
                        const existingPaths = new Set(get().detectedRuntimes.map(r => r.path));
                        if (!existingPaths.has(result.path)) {
                            set({ detectedRuntimes: [...get().detectedRuntimes, result] });
                        }
                    } else {
                        alert("Invalid Java executable selected.");
                    }
                }
            },

            testPath: async (path) => {
                if (!path) return { path, version: '', majorVersion: 0, isValid: false, errorMessage: 'Path is empty' };
                return await javaApi.testJava(path);
            },

                        removeRuntime: (path) => {
                set({ detectedRuntimes: get().detectedRuntimes.filter(r => r.path !== path) });
            },

            installRecommended: async (major) => {
                try {
                    const result = await javaApi.installJava(major);
                    if (result.isValid) {
                        set({ detectedRuntimes: [...get().detectedRuntimes, result] });
                        get().setJavaMapping(major, result.path);
                    } else {
                        alert("Failed to install Java: " + result.errorMessage);
                    }
                } catch (e: any) {
                    alert("Error during installation: " + e);
                }
            }
        }),
                { 
            name: 'conduit-java-settings',
            partialize: (state) => ({ settings: state.settings })
        }
    )
);
            
            
    