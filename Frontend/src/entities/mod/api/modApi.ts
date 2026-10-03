import { invoke } from '@/shared/ipc/ipcClient';
import { ModDetails, ModVersion, TeamMember, DependencyProject, SearchModsResponse, ModrinthTag } from '@/shared/api/types/modrinth';

export const modApi = {
    searchMods: (params: { query: string, facets: string, sort: string, offset: number, limit: number, source?: string }) => 
        invoke<SearchModsResponse>('SEARCH_MODS', params),
    
    getTags: (tagType: string, source?: string) => 
        invoke<ModrinthTag[]>('GET_MODRINTH_TAGS', source ? { tagType, source } : tagType),
    
    getProjectDetails: (id: string, source?: string) => 
        invoke<ModDetails>('GET_PROJECT_DETAILS', source ? { projectId: id, source } : id),
            
        
    getProjectVersions: (params: { projectId: string, gameVersion: string, loader: string, source?: string }) => 
        invoke<ModVersion[]>('GET_PROJECT_VERSIONS', params),
        
    getProjectTeam: (id: string, source?: string) => 
        invoke<TeamMember[]>('GET_PROJECT_TEAM', source ? { projectId: id, source } : id),
        
    getProjectsBulk: (ids: string[]) => 
        invoke<DependencyProject[]>('GET_PROJECTS_BULK', ids),
        
    getVersionDetails: (versionId: string) =>
        invoke<ModVersion>('GET_VERSION_DETAILS', versionId),
        
    downloadVersion: (url: string, filename: string) =>
        invoke('DOWNLOAD_MOD_VERSION', { url, filename })
};
    
