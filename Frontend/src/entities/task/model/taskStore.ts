import { create } from 'zustand';

export interface AppTask {
    id: string;
    type: string;
    title: string;
    status: string;
    progress: number;
    isCancellable: boolean;
    instanceId?: string | null;
}

export function getTaskId(task: AppTask): string {
    return task.id;
}

export function getTaskType(task: AppTask): string {
    return (task.type || '').toLowerCase();
}

export function getTaskTitle(task: AppTask): string {
    return task.title || '';
}

export function getTaskStatus(task: AppTask): string {
    return task.status || '';
}

export function getTaskProgress(task: AppTask): number {
    return task.progress || 0;
}

export function isTaskCancellable(task: AppTask): boolean {
    return task.isCancellable ?? false;
}

export function getTaskInstanceId(task: AppTask): string | null {
    return task.instanceId ?? null;
}

interface TaskState {
    tasks: AppTask[];
    setTasks: (tasks: AppTask[]) => void;
}

export const useTaskStore = create<TaskState>((set) => ({
    tasks: [],
    setTasks: (tasks) => set({ tasks })
}));


