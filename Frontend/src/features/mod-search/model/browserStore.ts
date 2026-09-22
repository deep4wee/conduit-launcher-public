import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { modApi } from '@/entities/mod';
import { ModrinthProject } from '@/shared/api/types/modrinth';
import { InstanceDto } from '@/entities/instance';

interface BrowserState {
    isSidebarOpen: boolean;
    activePlatform: 'modrinth' | 'curseforge';
    query: string;
    projectType: string;
    selectedLoader: string;
    selectedVersion: string;
    environment: string;
    selectedCategories: string[];
    sort: string;
    offset: number;
    limit: number;
    targetInstance: InstanceDto | null;
    
    results: ModrinthProject[];
    totalHits: number;
    isSearching: boolean;
    hasLoadedOnce: boolean;

    setSidebarOpen: (isOpen: boolean) => void;
    setActivePlatform: (platform: 'modrinth' | 'curseforge') => void;
    setQuery: (query: string) => void;
    setSearchParam: (key: keyof BrowserState, value: any) => void;
    setTargetInstance: (instance: InstanceDto | null) => void;
    clearTargetInstance: () => void;
    performSearch: () => Promise<void>;
}

export const useBrowserStore = create<BrowserState>()(
    persist(
        (set, get) => ({
            isSidebarOpen: true,
            activePlatform: 'modrinth',
            query: '',
            projectType: 'project_type:mod',
            selectedLoader: '',
            selectedVersion: '',
            environment: '',
            selectedCategories: [],
            sort: 'relevance',
            offset: 0,
            limit: 20,
            targetInstance: null,

            results: [],
            totalHits: 0,
            isSearching: false,
            hasLoadedOnce: false,

            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
    
            setQuery: (query) => set({ query }),

            setActivePlatform: (platform) => {
                set({ activePlatform: platform });
                if (platform === 'modrinth') {
                    get().performSearch();
                }
            },

            setTargetInstance: (instance) => {
                if (!instance) {
                    set({ targetInstance: null });
                    return;
                }
                const isVanilla = !instance.loaderType || instance.loaderType.toLowerCase() === 'vanilla';
                const loader = !isVanilla ? instance.loaderType.toLowerCase() : '';
                const currentType = get().projectType;
                const newProjectType = isVanilla && (currentType === 'project_type:mod' || currentType === 'project_type:modpack')
                    ? 'project_type:resourcepack'
                    : currentType === 'project_type:modpack'
                        ? 'project_type:mod'
                        : currentType;

                set({
                    targetInstance: instance,
                    selectedVersion: instance.minecraftVersion || '',
                    selectedLoader: loader,
                    projectType: newProjectType,
                    offset: 0
                });
                get().performSearch();
            },

            clearTargetInstance: () => {
                set({ targetInstance: null, selectedLoader: '', selectedVersion: '', offset: 0 });
                get().performSearch();
            },

        setSearchParam: (key, value) => {
        set({ [key]: value });
        // Скидаємо offset на 0, якщо змінили фільтр (зміна ліміту також скидає на 1 сторінку)
        if (key !== 'offset' && key !== 'isSearching' && key !== 'results' && key !== 'totalHits' && key !== 'query') {
            set({ offset: 0 });
        }
        get().performSearch();
    },
            

    performSearch: async () => {
        const state = get();
        
        if (state.activePlatform === 'curseforge') {
            set({ results: [], totalHits: 0 });
            return;
        }

        set({ isSearching: true });
        try {
            const facetsArray = [[state.projectType]];
            
            if ((state.projectType === 'project_type:mod' || state.projectType === 'project_type:modpack') && state.selectedLoader !== '') {
                facetsArray.push([`categories:${state.selectedLoader}`]);
            }
            if (state.selectedVersion !== '') {
                facetsArray.push([`versions:${state.selectedVersion}`]);
            }
            
            if (state.environment === 'client') {
                facetsArray.push(['client_side:required', 'client_side:optional']);
            } else if (state.environment === 'server') {
                facetsArray.push(['server_side:required', 'server_side:optional']);
            }

            // Виправлено: дублювання видалено
            if (state.selectedCategories.length > 0) {
                facetsArray.push(state.selectedCategories.map(c => `categories:${c}`));
            }

            const response = await modApi.searchMods({
                query: state.query,
                facets: JSON.stringify(facetsArray),
                sort: state.sort,
                offset: state.offset,
                limit: state.limit
            });

            if (response && response.hits) {
                set({ results: response.hits, totalHits: response.total_hits || 0, hasLoadedOnce: true });
            }
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            set({ isSearching: false });
        }
    }
}),
        {
            name: 'conduit-browser-state',
            partialize: (state) => ({
                isSidebarOpen: state.isSidebarOpen,
                activePlatform: state.activePlatform,
                limit: state.limit,
                sort: state.sort
            })
        }
    )
);
    