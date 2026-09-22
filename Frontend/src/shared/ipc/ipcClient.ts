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

const pendingRequests = new Map<string, { resolve: (val: any) => void; reject: (err: any) => void }>();
const eventListeners = new Map<string, Set<(data: any) => void>>();

if (typeof window !== 'undefined' && window.external && window.external.receiveMessage) {
    window.external.receiveMessage((msg: string) => {
        try {
            const parsed: IpcResponse = JSON.parse(msg);
            const { type, eventName, id, data } = parsed;

            // Подія (Broadcast)
            if (type === 'EVENT' && eventName) {
                const listeners = eventListeners.get(eventName);
                if (listeners) {
                    listeners.forEach(cb => cb(data));
                }
            }
            // Відповідь на конкретний запит
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
            console.error("[IPC] Failed to parse message:", msg);
        }
    });
}


export const invoke = <T = unknown>(action: string, payload?: unknown): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
        const id = crypto.randomUUID();
        pendingRequests.set(id, { resolve, reject });

        const request: IpcRequest = { id, action, payload };
        if (typeof window !== 'undefined' && window.external && window.external.sendMessage) {
            window.external.sendMessage(JSON.stringify(request));
        } else {
            console.warn("[IPC] Mock mode: C# Backend not found.");
            setTimeout(() => resolve("Mock Response" as unknown as T), 500);
        }
    });
};


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

