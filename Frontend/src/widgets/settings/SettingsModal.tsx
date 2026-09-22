import { useState } from 'react';
import { X, Palette, Languages, Coffee, Monitor, Settings, Terminal, HardDrive } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useUiStore } from '@/shared/model/uiStore';
import { StorageSettingsTab } from './ui/tabs/StorageSettingsTab';
import { AppearanceTab } from './ui/tabs/AppearanceTab';
import { LanguageTab } from './ui/tabs/LanguageTab';
import { SystemTab } from './ui/tabs/SystemTab';
import { DeveloperTab } from './ui/tabs/DeveloperTab';
import { JavaTab } from './ui/tabs/JavaTab';
import { cn } from '@/shared/lib/utils';

type Tab = 'appearance' | 'language' | 'storage' | 'java' | 'system' | 'developer';
            

export function SettingsModal() {
    const { t } = useTranslation();
    const { isSettingsOpen, setSettingsOpen } = useUiStore();
            
    const [activeTab, setActiveTab] = useState<Tab>('appearance');

    if (!isSettingsOpen) return null;

    const tabs = [
        { id: 'appearance', icon: Palette, label: t('settings.tabs.appearance') },
        { id: 'language', icon: Languages, label: t('settings.tabs.language') },
        { id: 'storage', icon: HardDrive, label: t('settings.tabs.storage', 'Storage') },
        { id: 'java', icon: Coffee, label: t('settings.tabs.java') },
        { id: 'system', icon: Monitor, label: t('settings.tabs.system') },
        { id: 'developer', icon: Terminal, label: t('settings.tabs.developer') },
    ] as const;

    return (
        <div className="absolute inset-0 z-[100] flex items-center justify-center p-8 animate-in fade-in duration-200">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSettingsOpen(false)} />

            <div className="relative w-full max-w-4xl h-[80vh] bg-background border border-border rounded-2xl shadow-2xl flex overflow-hidden">

                <div className="w-64 bg-surface border-r border-border flex flex-col shrink-0">
                    <div className="p-6 pb-2">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Settings className="w-5 h-5 text-secondary" />
                            {t('settings.title')}
                        </h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all text-sm outline-none",
                                    activeTab === tab.id
                                        ? "bg-accent/10 text-accent"
                                        : "text-secondary hover:bg-surfaceHover hover:text-primary"
                                )}
                            >
                                <tab.icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden bg-background">
                    <div className="h-14 flex items-center justify-end px-4 shrink-0">
                        <button
                            onClick={() => setSettingsOpen(false)}
                            className="p-2 hover:bg-surface rounded-full text-secondary hover:text-primary transition-colors outline-none"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto px-8 pb-8 pt-2">
                        {activeTab === 'appearance' && <AppearanceTab />}
                        {activeTab === 'storage' && <StorageSettingsTab />}
                        {activeTab === 'language' && <LanguageTab />}
                        {activeTab === 'system' && <SystemTab />}
                                                {activeTab === 'developer' && <DeveloperTab />}
                        {activeTab === 'java' && <JavaTab />}
                    </div>
            
            
                </div>

            </div>
        </div>
    );
}
