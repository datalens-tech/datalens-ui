type ManualErrorArgs = {
    message: string;
    originalError?: Error;
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
    debug?: Record<string, unknown>;
};

type ManualErrorFields = Omit<ManualErrorArgs, 'message' | 'originalError'>;

export class ManualError extends Error implements ManualErrorFields {
    code?: string;
    status?: number;
    details?: Record<string, unknown>;
    debug?: Record<string, unknown>;
    _manualError = true;

    constructor({message, originalError, code, status, details, debug}: ManualErrorArgs) {
        super(message);

        this.code = code;
        this.status = status;
        this.details = details;
        this.debug = debug;

        if (originalError) {
            this.name = originalError.name;
            this.stack = originalError.stack;
        }
    }
}

export function isManualError(error: any): error is ManualError {
    return Boolean((error as ManualError)._manualError);
}
