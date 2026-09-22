import { invoke } from '@/shared/ipc/ipcClient';

export interface GameVersionDto {
    id: string;
    type: string;
    releaseTime: string;
}

export const versionApi = {
    getVanillaVersions: async (): Promise<GameVersionDto[]> => {
        return invoke('GET_MC_VERSIONS', {});
    },

    getFabricLoaders: async (): Promise<string[]> => {
        return invoke('GET_FABRIC_LOADERS', {});
    },

    getForgeLoaders: async (mcVersion: string): Promise<string[]> => {
        return invoke('GET_FORGE_LOADERS', { mcVersion });
    },
    
    getForgeSupportedVersions: async (): Promise<string[]> => {
        return invoke('GET_FORGE_MC_VERSIONS', {});
    },
    
    getNeoForgeLoaders: async (mcVersion: string): Promise<string[]> => {
        return invoke('GET_NEOFORGE_LOADERS', { mcVersion });
    },
    
    getQuiltLoaders: async (): Promise<string[]> => {
        return invoke('GET_QUILT_LOADERS', {});
    },
    
    getLiteLoaderLoaders: async (mcVersion: string): Promise<string[]> => {
        return invoke('GET_LITELOADER_LOADERS', { mcVersion });
    }
};
