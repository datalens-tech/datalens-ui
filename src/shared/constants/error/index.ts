export class ServerError extends Error {
    readonly status: number;
    readonly code?: string;

    constructor(message: string, {status, code}: {status: number; code?: string}) {
        super(message);
        this.name = 'ServerError';
        this.status = status;
        this.code = code;
    }
}
