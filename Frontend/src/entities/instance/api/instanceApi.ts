import { invoke } from '@/shared/ipc/ipcClient';

export interface CreateInstancePayload {
  name: string;
  minecraftVersion: string;
  loaderType: string;
  loaderVersion: string;
  iconBase64: string | null;
}

export interface InstanceDto {
  id: string;
  name: string;
  minecraftVersion: string;
  loaderType: string;
  loaderVersion: string;
  iconBase64: string | null;
  storageMode: string;
  created: string;
  playTimeSeconds?: number;
  lastPlayed?: string;
  overrideMemory?: number;
  overrideJavaPath?: string;
  jvmFlags?: string;
  windowWidth?: number;
  windowHeight?: number;
  fullscreen?: boolean;
}

export interface InstalledModDto {
  fileName: string;
  isEnabled: boolean;
  modId?: string;
  modName?: string;
  version?: string;
  fileSizeBytes: number;
  modifiedDate: string;
  autoEnvironment?: string;
  userEnvironmentOverride?: string;
  projectId?: string;
  versionId?: string;
  source?: string;
  isRoughDetection?: boolean;
  isDirectInstall?: boolean;
  projectType?: string;
  iconUrl?: string;
  author?: string;
}

export interface ModUpdateDto {
  projectId: string;
  modName: string;
  currentVersion: string;
  currentFileName: string;
  latestVersion: string;
  latestVersionId: string;
  changelog?: string;
  downloadUrl?: string;
  iconUrl?: string;
  source: string;
  hasUpdate: boolean;
}

interface DownloadModPayload {
  url: string;
  filename: string;
  instanceId: string;
  projectId?: string;
  versionId?: string;
  environment?: string; // "Client", "Server", "Both"
  source?: string; // e.g. "Modrinth", "CurseForge"
  modName?: string;
  iconUrl?: string;
}

export const instanceApi = {
  createInstance: async (payload: CreateInstancePayload): Promise<void> => {
    await invoke('CREATE_INSTANCE', payload);
  },
  getInstances: async (): Promise<InstanceDto[]> => {
    return invoke('GET_INSTANCES', {});
  },
  scanMods: async (instanceId: string): Promise<void> => {
    await invoke('SCAN_MODS', { instanceId });
  },
  repairInstance: async (instanceId: string): Promise<void> => {
    await invoke('REPAIR_INSTANCE', { instanceId });
  },
  installModpack: async (url: string, instanceName: string): Promise<void> => {
    await invoke('INSTALL_MODPACK', { url, instanceName });
  },
  exportModpack: async (instanceId: string, exportType: string, overrides: Record<string, string>): Promise<void> => {
    await invoke('EXPORT_MODPACK', { instanceId, exportType, overrides });
  },
  preflightModInstall: async (instanceId: string, projectId: string, versionId: string, source?: string): Promise<DependencyPlan> => {
    return invoke('PREFLIGHT_MOD_INSTALL', { instanceId, projectId, versionId, source });
  },
  confirmModInstall: async (instanceId: string, plan: DependencyPlan): Promise<void> => {
    await invoke('CONFIRM_MOD_INSTALL', { instanceId, plan });
  },
  analyzeModDelete: async (instanceId: string, projectId: string): Promise<DeleteModImpactAnalysis> => {
    return invoke('ANALYZE_MOD_DELETE', { instanceId, projectId });
  },
  confirmModDelete: async (instanceId: string, projectId: string, removeOrphans: boolean, removeStandaloneMods?: boolean): Promise<void> => {
    await invoke('CONFIRM_MOD_DELETE', { instanceId, projectId, removeOrphans, removeStandaloneMods: removeStandaloneMods ?? false });
  },
  deleteInstance: async (instanceId: string): Promise<void> => {
    await invoke('DELETE_INSTANCE', { instanceId });
  },
  renameInstance: async (instanceId: string, newName: string): Promise<void> => {
    await invoke('RENAME_INSTANCE', { instanceId, newName });
  },
  updateInstance: async (instanceId: string, updates: Partial<InstanceDto>): Promise<void> => {
    await invoke('UPDATE_INSTANCE', { instanceId, updates });
  },
  openInstanceFolder: async (instanceId: string): Promise<void> => {
    await invoke('OPEN_INSTANCE_FOLDER', { instanceId });
  },
  launchInstance: async (instanceId: string): Promise<void> => {
    await invoke('LAUNCH', { instanceId });
  },
  getInstalledMods: async (instanceId: string): Promise<InstalledModDto[]> => {
    return invoke('GET_INSTALLED_MODS', { instanceId });
  },
  toggleMod: async (instanceId: string, fileName: string): Promise<string> => {
    return invoke('TOGGLE_MOD', { instanceId, fileName });
  },
  deleteMod: async (instanceId: string, fileName: string): Promise<void> => {
    await invoke('DELETE_MOD', { instanceId, fileName });
  },
  downloadMod: async (payload: DownloadModPayload): Promise<void> => {
    await invoke('DOWNLOAD_MOD_VERSION', payload);
  },
  checkModUpdates: async (instanceId: string): Promise<ModUpdateDto[]> => {
    return invoke('CHECK_MOD_UPDATES', { instanceId });
  },
  applyModUpdate: async (instanceId: string, projectId: string, targetVersionId: string): Promise<void> => {
    await invoke('APPLY_MOD_UPDATE', { instanceId, projectId, targetVersionId });
  }
};

export type ResolutionStatus = 0 | 1 | 2 | 3;
// 0 = Success, 1 = ConflictIncompatible, 2 = VersionNotFound, 3 = NetworkError

export interface DependencyConflict {
  sourceModName: string;
  incompatibleWithModName: string;
  reason: string;
}

export interface ModInstallCandidate {
  projectId: string;
  versionId: string;
  title: string;
  fileName: string;
  downloadUrl: string;
  sizeBytes: number;
  isDirectInstall: boolean;
  projectType: string;
  iconUrl?: string;
  author?: string;
  versionNumber?: string;
}

export interface DependencyPlan {
  status: ResolutionStatus;
  errorMessage?: string;
  filesToDownload: ModInstallCandidate[];
  alreadySatisfiedUpdates: Record<string, string[]>;
  conflicts: DependencyConflict[];
  totalBytesToDownload: number;
}

export interface ModImpactInfo {
  projectId: string;
  name: string;
  fileName: string;
  isLibrary?: boolean;
}

export interface DeleteModImpactAnalysis {
  brokenDependents: ModImpactInfo[];
  orphanedLibraries: ModImpactInfo[];
  orphanedMods?: ModImpactInfo[];
  isSafeToDelete: boolean;
}
