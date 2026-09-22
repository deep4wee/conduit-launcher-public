import { launchApi } from './api/launchApi';
import { Button } from '@/shared/ui/Button';
import { useTaskStore, getTaskType, getTaskInstanceId } from '@/entities/task';
import { useTranslation } from 'react-i18next';

interface LaunchButtonProps {
    instanceId?: string;
    mcVersion?: string;
    loaderType?: string;
    loaderVersion?: string;
}

export function LaunchButton({ instanceId, mcVersion }: LaunchButtonProps) {
    const { t } = useTranslation();
    const tasks = useTaskStore(s => s.tasks);
    
    const isGameRunning = tasks.some(t => 
        getTaskType(t) === 'game' && (!instanceId || getTaskInstanceId(t) === instanceId)
    );

    const handleLaunch = async () => {
        const targetId = instanceId || mcVersion;
        if (!targetId) return;

        try {
            await launchApi.launch(targetId);
        } catch (error) {
            console.error("Launch error:", error);
        }
    };

    const handleKill = async () => {
        await launchApi.killProcess();
    };

    if (isGameRunning) {
        return (
            <div className="flex gap-2 w-full justify-center">
                <Button disabled className="flex-1 shadow-lg cursor-wait opacity-80">
                    {t('launcher.running', 'Game is running')}
                </Button>
                <Button variant="danger" onClick={handleKill} className="px-3" title={t('launcher.kill', 'Force Stop')}>
                    ⏹
                </Button>
            </div>
        );
    }

    return (
        <Button
            onClick={handleLaunch}
            className="w-full shadow-lg shadow-accent/20"
        >
            ▶ {t('launcher.launch', 'Launch Game')}
        </Button>
    );
}