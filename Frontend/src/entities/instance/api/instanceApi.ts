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
}

export interface DownloadModPayload {
  url: string;
  filename: string;
  instanceId: string;
  projectId?: string;
  versionId?: string;
  environment?: string; // "Client", "Server", "Both"
  source?: string; // e.g. "Modrinth", "CurseForge"
  modName?: string;
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
  installModpack: async (url: string, instanceName: string): Promise<void> => {
    await invoke('INSTALL_MODPACK', { url, instanceName });
  },
  deleteInstance: async (instanceId: string): Promise<void> => {
    await invoke('DELETE_INSTANCE', { instanceId });
  },
  renameInstance: async (instanceId: string, newName: string): Promise<void> => {
    await invoke('RENAME_INSTANCE', { instanceId, newName });
  },
  openInstanceFolder: async (instanceId: string): Promise<void> => {
    await invoke('OPEN_INSTANCE_FOLDER', { instanceId });
  },
  launchInstance: async (instanceId: string): Promise<void> => {
    await invoke('LAUNCH', { instanceId }); // Map to old LAUNCH
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
  }
};
