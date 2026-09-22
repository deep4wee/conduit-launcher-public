export interface JavaRuntime {
    path: string;
    version: string;
    majorVersion: number;
    isValid: boolean;
    errorMessage: string;
}

export interface JavaSettings {
    defaultJava8: string;
    defaultJava17: string;
    defaultJava21: string;
}
            
    