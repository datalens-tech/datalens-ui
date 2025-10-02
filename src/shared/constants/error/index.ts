export class ServerError extends Error {
    readonly status: number;
    readonly code?: string;
    readonly details?: unknown;

    constructor(
        message: string,
        {status, code, details}: {status: number; code?: string; details?: unknown},
    ) {
        super(message);
        this.name = 'ServerError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
