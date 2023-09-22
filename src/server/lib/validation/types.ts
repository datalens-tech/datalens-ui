import type {ErrorObject} from 'ajv';

export type ValidationConfig = {
    [key: string]: any;

    query?: Object;
    params?: Object;
    body?: Object;
};

export type ValidationResult = {
    success: boolean;
    message?: string;
    details?: ErrorObject[] | null | undefined;
};
