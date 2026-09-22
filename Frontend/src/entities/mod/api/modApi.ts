import { invoke } from '@/shared/ipc/ipcClient';
import { ModDetails, ModVersion, TeamMember, DependencyProject } from '@/shared/api/types/modrinth';

export const modApi = {
    searchMods: (params: { query: string, facets: string, sort: string, offset: number, limit: number }) => 
        invoke<any>('SEARCH_MODS', params),
    
    getTags: (tagType: string) => 
        invoke<any[]>('GET_MODRINTH_TAGS', tagType),
    
    getProjectDetails: (id: string) => 
        invoke<ModDetails>('GET_PROJECT_DETAILS', id),
        
    getProjectVersions: (params: { projectId: string, gameVersion: string, loader: string }) => 
        invoke<ModVersion[]>('GET_PROJECT_VERSIONS', params),
        
    getProjectTeam: (id: string) => 
        invoke<TeamMember[]>('GET_PROJECT_TEAM', id),
        
    getProjectsBulk: (ids: string[]) => 
        invoke<DependencyProject[]>('GET_PROJECTS_BULK', ids),
        
    getVersionDetails: (versionId: string) =>
        invoke<ModVersion>('GET_VERSION_DETAILS', versionId),
        
    downloadVersion: (url: string, filename: string) =>
        invoke('DOWNLOAD_MOD_VERSION', { url, filename })
};
    