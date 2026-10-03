declare global {
    interface External {
        sendMessage: (msg: string) => void;
        receiveMessage: (callback: (msg: string) => void) => void;
    }
}

export interface IpcResponse<T = unknown> {
    id?: string;
    type: 'SUCCESS' | 'ERROR' | 'EVENT';
    eventName?: string;
    data?: T;
}

export interface IpcRequest<T = unknown> {
    id: string;
    action: string;
    payload?: T;
}

const pendingRequests = new Map<string, { resolve: (val: unknown) => void; reject: (err: Error | unknown) => void }>();
const eventListeners = new Map<string, Set<(data: unknown) => void>>();

if (typeof window !== 'undefined' && window.external && window.external.receiveMessage) {
    window.external.receiveMessage((msg: string) => {
        try {
            const parsed: IpcResponse = JSON.parse(msg);
            const { type, eventName, id, data } = parsed;

            // 1. Подія (Broadcast)
            if (type === 'EVENT' && eventName) {
                const listeners = eventListeners.get(eventName);
                if (listeners) {
                    listeners.forEach(cb => cb(data));
                }
            }
            // 2. Відповідь на конкретний запит
            else if (id) {
                const promiseHooks = pendingRequests.get(id);
                if (promiseHooks) {
                    if (type === 'SUCCESS') {
                        promiseHooks.resolve(data);
                    } else {
                        promiseHooks.reject(new Error(typeof data === 'string' ? data : JSON.stringify(data)));
                    }
                    pendingRequests.delete(id);
                }
            }
        } catch (e) {
            console.error("[IPC] Failed to parse message:", msg, e);
        }
    });
}

/**
 * Відправляє запит до C# Ядра та чекає на типізовану відповідь.
 */
export const invoke = <T = unknown>(action: string, payload?: unknown): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        const id = crypto.randomUUID();
        pendingRequests.set(id, { resolve: resolve as (val: unknown) => void, reject });

        const request: IpcRequest = { id, action, payload };
        if (typeof window !== 'undefined' && window.external && window.external.sendMessage) {
            window.external.sendMessage(JSON.stringify(request));
        } else {
            // Check for test/preview mock handler
            const win = typeof window !== 'undefined' ? (window as unknown as { __mockIpc?: Record<string, unknown> }) : undefined;
            if (win && win.__mockIpc && win.__mockIpc[action] !== undefined) {
                const mock = win.__mockIpc[action];
                const result = typeof mock === 'function' ? mock(payload) : mock;
                setTimeout(() => resolve(result as T), 50);
                return;
            }

            console.warn(`[IPC] Mock mode: C# Backend not found for action '${action}'.`);
            
            // Sensible fallback mocks for development/preview without backend
            let defaultMock: unknown = {};
            if (action === 'GET_INSTANCES') {
                defaultMock = [
                    {
                        id: 'test-instance',
                        name: 'Survival Modpack 1.20.1',
                        minecraftVersion: '1.20.1',
                        loaderType: 'Fabric',
                        loaderVersion: '0.15.11',
                        storageMode: 'Hardlink',
                        path: 'C:/games/conduit/instances/test-instance',
                        installedModsCount: 42,
                        totalPlayTime: 3600
                    }
                ];
            } else if (action === 'GET_INSTANCE_SETTINGS') {
                defaultMock = {
                    instanceId: (payload as { instanceId?: string })?.instanceId || 'test-instance',
                    storageMode: 'Hardlink',
                    maxMemoryMb: 4096,
                    minMemoryMb: 2048,
                    jvmArgs: '-XX:+UseG1GC',
                    customJavaPath: '',
                    windowWidth: 854,
                    windowHeight: 480
                };
            } else if (action === 'GET_PREFS' || action === 'GET_SETTINGS') {
                defaultMock = {
                    theme: 'dark',
                    language: 'uk',
                    memory: 4096,
                    storageMode: 'Hardlink',
                    closeOnLaunch: false
                };
            } else if (action === 'DETECT_JAVA') {
                defaultMock = [
                    { majorVersion: 21, version: '21.0.2', path: 'C:/Program Files/Java/jdk-21/bin/java.exe', is64Bit: true, vendor: 'Eclipse Adoptium' },
                    { majorVersion: 17, version: '17.0.10', path: 'C:/Program Files/Java/jdk-17/bin/java.exe', is64Bit: true, vendor: 'Eclipse Adoptium' },
                    { majorVersion: 8, version: '1.8.0_392', path: 'C:/Program Files/Java/jdk-8/bin/java.exe', is64Bit: true, vendor: 'Eclipse Adoptium' }
                ];
            } else if (action === 'GET_MC_VERSIONS') {
                defaultMock = [
                    { id: '1.20.1', type: 'release' },
                    { id: '1.20.4', type: 'release' },
                    { id: '1.21', type: 'release' }
                ];
            } else if (action === 'GET_FABRIC_LOADERS') {
                defaultMock = ['0.15.11', '0.15.10', '0.15.9'];
            } else if (action === 'GET_QUILT_LOADERS') {
                defaultMock = ['0.25.0', '0.24.0'];
            } else if (action === 'GET_FORGE_MC_VERSIONS') {
                defaultMock = ['1.20.1', '1.19.2'];
            } else if (action === 'CHECK_MOD_UPDATES' || action === 'GET_INSTALLED_MODS' || (action.startsWith('GET_') && action.endsWith('S'))) {
                defaultMock = [];
            }
            setTimeout(() => resolve(defaultMock as T), 50);
        }
    });
};

/**
 * Підписується на глобальну подію від C# Ядра. Повертає функцію для відписки.
 */
export const subscribe = <T = unknown>(eventName: string, callback: (data: T) => void) => {
    if (!eventListeners.has(eventName)) {
        eventListeners.set(eventName, new Set());
    }
    const handler = callback as (data: unknown) => void;
    eventListeners.get(eventName)!.add(handler);

    return () => {
        const listeners = eventListeners.get(eventName);
        if (listeners) {
            listeners.delete(handler);
            if (listeners.size === 0) eventListeners.delete(eventName);
        }
    };
};

