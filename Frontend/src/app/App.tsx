import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { subscribe } from '@/shared/ipc/ipcClient';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

import { usePrefsStore } from '@/entities/prefs';
import { useTaskStore } from '@/entities/task';
import { ToastContainer, useToastStore } from '@/shared/ui/Toast';

import { Sidebar } from '@/widgets/sidebar/Sidebar';
import { Topbar } from '@/widgets/topbar/Topbar';
import { SettingsModal } from '@/widgets/settings';
import { SplashScreen } from '@/widgets/splash/SplashScreen';
import { WindowResizeHandles } from '@/shared/ui/WindowControls/WindowResizeHandles';

import { HomePage } from '@/pages/home/HomePage';
import { BrowserPage } from '@/pages/browser/BrowserPage';
import { ModDetailsPage } from '@/pages/browser/ModDetailsPage';
import { VersionDetailsPage } from '@/pages/version-details';
import { InstancesPage } from '@/pages/instances/InstancesPage';
import { InstanceDetailsPage } from '@/pages/instance-details/InstanceDetailsPage';

export function App() {
  const { theme, uiScale, fontFamily, initPrefs } = usePrefsStore();
  const [isBooting, setIsBooting] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    let resolved = false;
    const finishBoot = () => {
      if (resolved) return;
      resolved = true;
      document.body.classList.add('window-ready');
      setTimeout(() => setIsBooting(false), 1200);
    };

    const safetyTimer = setTimeout(finishBoot, 2000);

    initPrefs().finally(() => {
      clearTimeout(safetyTimer);
      finishBoot();
    });
  }, [initPrefs]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark', 'oled', 'dracula', 'nord');
    root.classList.add(theme);

    root.classList.remove('font-inter', 'font-poppins', 'font-jetbrains', 'font-system');
    root.classList.add(`font-${fontFamily}`);

    root.style.fontSize = `${16 * uiScale}px`;
  }, [theme, uiScale, fontFamily]);

  useEffect(() => {
    const unsubTasks = subscribe('TASKS_UPDATE', (tasks: any[]) => {
      useTaskStore.getState().setTasks(tasks);
    });

    const unsubGameClosed = subscribe('GAME_CLOSED', () => {
      useToastStore.getState().addToast({ message: t('game.terminated', 'Game process terminated'), type: 'info' });
    });

    const unsubError = subscribe('ERROR', (msg: string) => {
      useToastStore.getState().addToast({ message: `${t('common.error', 'Error')}: ${msg}`, type: 'error' });
    });

    return () => {
      unsubTasks();
      unsubGameClosed();
      unsubError();
    };
  }, [t]);

  return (
    <HashRouter>
      <div 
        className="flex h-screen w-full bg-background text-primary overflow-hidden relative"
        onContextMenu={(e) => e.preventDefault()}
      >
        <WindowResizeHandles />

        {isBooting && <SplashScreen />}

        <Sidebar />
        <SettingsModal />

        <div className="flex flex-col flex-1 ml-16 relative h-full">
          <Topbar />
          <main className="flex-1 overflow-hidden bg-background">
            <Routes>
              <Route path="/home" element={<div className="h-full overflow-y-auto p-0"><HomePage /></div>} />
              <Route path="/browser" element={<BrowserPage />} />
              <Route path="/browser/mod/:id" element={<ModDetailsPage />} />
              <Route path="/browser/mod/:id/version/:versionId" element={<VersionDetailsPage />} />

              <Route path="/instances" element={<InstancesPage />} />
              <Route path="/instances/:id" element={<InstanceDetailsPage />} />
              <Route path="/servers" element={
                <motion.div 
                  initial={{ opacity: 0, y: 6 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0 }} 
                  transition={{ duration: 0.2 }} 
                  className="text-secondary p-8"
                >
                  Servers (In Dev)
                </motion.div>
              } />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </main>
          <ToastContainer />
        </div>
      </div>
    </HashRouter>
  );
}