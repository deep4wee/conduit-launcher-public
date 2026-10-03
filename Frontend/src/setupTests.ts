import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock ipcClient globally
vi.mock('@/shared/ipc/ipcClient', () => ({
  invoke: vi.fn(() => Promise.resolve()),
  subscribe: vi.fn(() => () => {})
}));
