import { invoke } from '@/shared/ipc/ipcClient';
import { JavaRuntime } from '../model/types';

export const javaApi = {
    detectJava: () => invoke<JavaRuntime[]>('DETECT_JAVA'),
    testJava: (path: string) => invoke<JavaRuntime>('TEST_JAVA', path),
    installJava: (major: number) => invoke<JavaRuntime>('INSTALL_JAVA', major),
    browseFile: () => invoke<string | null>('BROWSE_FILE')
};
            
            
            
    