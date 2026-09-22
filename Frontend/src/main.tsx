import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/App';
import './app/styles/index.css';
import './shared/i18n/i18n';
import { invoke } from '@/shared/ipc/ipcClient';

// Intercept React logs for batch sending (Throttling) to C#
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

let logBuffer: Array<{ level: string, message: string }> = [];
let logTimer: ReturnType<typeof setTimeout> | null = null;

const sendLogs = () => {
  if (logBuffer.length === 0) return;
  const batch = [...logBuffer];
  logBuffer = [];
  invoke('LOG_BATCH', batch).catch(() => {});
};

const queueLog = (level: string, message: string) => {
  logBuffer.push({ level, message });
  if (!logTimer) {
    logTimer = setTimeout(() => {
      sendLogs();
      logTimer = null;
    }, 250);
  }
};

console.log = (...args) => {
  originalConsoleLog(...args);
  queueLog('INFO', args.join(' '));
};
console.warn = (...args) => {
  originalConsoleWarn(...args);
  queueLog('WARN', args.join(' '));
};
console.error = (...args) => {
  originalConsoleError(...args);
  queueLog('ERROR', args.join(' '));
};
            

// Prevent zooming via Ctrl + Mouse Wheel
document.addEventListener('wheel', (e) => {
  if (e.ctrlKey) {
    e.preventDefault();
  }
}, { passive: false });

ReactDOM.createRoot(document.getElementById('root')!).render(
            
            
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
    