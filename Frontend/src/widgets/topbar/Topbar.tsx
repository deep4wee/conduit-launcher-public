import { useTranslation } from 'react-i18next';
import { Minus, Square, X } from 'lucide-react';
import { invoke } from '@/shared/ipc/ipcClient';
import { useTaskStore, getTaskType, getTaskTitle, getTaskStatus, getTaskProgress, isTaskCancellable, getTaskId } from '@/entities/task';
import { Dropdown } from '@/shared/ui/Dropdown';
import { cn } from '@/shared/lib/utils';

import { useLocation } from 'react-router-dom';

export function Topbar() {
    const { t } = useTranslation();
    const { tasks } = useTaskStore();
    const location = useLocation();

    const getPageTitle = () => {
        if (location.pathname.startsWith('/home')) return t('sidebar.home');
        if (location.pathname.startsWith('/browser')) return t('sidebar.browser');
        if (location.pathname.startsWith('/instances')) return t('sidebar.instances');
        if (location.pathname.startsWith('/servers')) return t('sidebar.servers');
        return '';
    };

    const formatTaskText = (text: string) => {
        if (!text) return '';
        if (text.includes('|')) {
            const [key, ...args] = text.split('|');
            return t(key, { val: args[0], current: args[0], total: args[1], defaultValue: text });
        }
        return t(text, { defaultValue: text });
    };
            
    const gameTask = tasks.find(t => getTaskType(t) === 'game');
    const downloadTasks = tasks.filter(t => getTaskType(t) === 'download' || getTaskType(t) === 'install');

    let mainDisplay = { icon: '💤', text: t('status.no_instances', 'No instances running'), color: 'text-secondary' };
    if (gameTask) {
        mainDisplay = { icon: '🎮', text: formatTaskText(getTaskTitle(gameTask)), color: 'text-accent' };
    } else if (downloadTasks.length > 0) {
        mainDisplay = { icon: '⬇️', text: t('status.activeTasks', '{{count}} active tasks...', { count: downloadTasks.length }), color: 'text-blue-400' };
    }

    return (
        <header 
            onPointerDown={(e) => {
                if ((e.target as HTMLElement).closest('.no-drag')) return;
                invoke('WINDOW_DRAG');
            }}
            className="h-14 bg-background border-b border-border flex items-center justify-between px-4 shrink-0 cursor-move"
        >
            <div className="flex-1 flex items-center pl-4">
                <h1 className="text-base font-bold tracking-tight text-primary/90">{getPageTitle()}</h1>
            </div>
            
            <div className="flex items-center gap-1 no-drag cursor-default">
                <Dropdown 
                    align="right"
                    trigger={
                        <button className="flex items-center gap-3 bg-surfaceHover/30 border border-border px-4 py-1.5 rounded-full shadow-inner mr-2 outline-none hover:bg-surfaceHover/60 transition-colors">
                            <span className="text-sm leading-none">{mainDisplay.icon}</span>
                            <span className={cn("text-xs font-bold", mainDisplay.color)}>{mainDisplay.text}</span>
                        </button>
                    }
                >
                    <div className="w-80 max-h-96 overflow-y-auto p-2 flex flex-col gap-2 custom-scrollbar">
                        <h3 className="text-[10px] font-bold text-secondary uppercase px-2 py-1 tracking-widest">{t('tasks.center', 'Task Center')}</h3>
                        {tasks.length === 0 ? (
                            <div className="text-secondary text-sm p-4 text-center bg-surface/50 rounded-lg border border-border/50">
                                {t('tasks.noActive', 'No active tasks')}
                            </div>
                        ) : (
                            tasks.map(task => {
                                const id = getTaskId(task);
                                const title = getTaskTitle(task);
                                const status = getTaskStatus(task);
                                const progress = getTaskProgress(task);
                                const cancellable = isTaskCancellable(task);
                                return (
                                   <div key={id} className="bg-surface border border-border p-3 rounded-xl flex flex-col gap-2 shadow-sm">
                                        <div className="flex justify-between items-start gap-2 text-sm font-bold text-primary">
                                            <span className="truncate flex-1">{formatTaskText(title)}</span>
                                            {cancellable && (
                                                <button onClick={(e) => { e.stopPropagation(); invoke('CANCEL_TASK', id); }} className="text-secondary hover:text-red-500 transition-colors shrink-0 outline-none" title={t('common.cancel', 'Cancel')}>
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                        <div className="text-xs text-secondary truncate">{formatTaskText(status)}</div>
                                        {progress > 0 && (
                                            <div className="w-full bg-background h-1.5 rounded-full overflow-hidden border border-border/50">
                                                <div className="bg-accent h-full transition-all duration-200 ease-out" style={{ width: `${progress}%` }} />
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </Dropdown>

                {/* Window Controls */}
            
                <button 
                    onClick={() => invoke('WINDOW_MINIMIZE')}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surfaceHover text-secondary hover:text-primary transition-colors outline-none"
                    title="Minimize"
                >
                    <Minus className="w-4 h-4" />
                </button>
                <button 
                    onClick={() => invoke('WINDOW_MAXIMIZE')}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-surfaceHover text-secondary hover:text-primary transition-colors outline-none"
                    title="Maximize"
                >
                    <Square className="w-3.5 h-3.5" />
                </button>
                                <button 
                    onClick={() => {
                        document.body.classList.remove('window-ready');
                        document.body.classList.add('window-closing');
                        setTimeout(() => invoke('WINDOW_CLOSE'), 200); // Wait for CSS animation
                    }}
                    className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-500 hover:text-white text-secondary transition-colors outline-none"
                    title="Close"
                >
                    <X className="w-4 h-4" />
                </button>
            
            </div>
        </header>
    );
}