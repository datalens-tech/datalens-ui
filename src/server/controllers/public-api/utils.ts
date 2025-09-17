import {AppError} from '@gravity-ui/nodekit';
import {AxiosError} from 'axios';
import isObject from 'lodash/isObject';
import type z from 'zod/v4';
import {ZodError} from 'zod/v4';

import {isGatewayError} from '../../utils/gateway';

import {PUBLIC_API_ERRORS, PublicApiError} from './constants';

export const prepareError = (
    error: unknown,
): {status: number; message: string; code?: string; details?: unknown} => {
    if (error instanceof PublicApiError) {
        const {code, message, details} = error;

        switch (code) {
            case PUBLIC_API_ERRORS.VALIDATION_ERROR: {
                return {status: 400, message, code, details};
            }

            case PUBLIC_API_ERRORS.ENDPOINT_NOT_FOUND: {
                return {status: 404, message, code, details};
            }

            default: {
                return {
                    status: 500,
                    message: 'Internal server error',
                };
            }
        }
    }

    if (isGatewayError(error)) {
        const {error: innerError} = error;

        if (innerError.status !== 500) {
            return {
                status: innerError.status,
                code: innerError.code,
                message: innerError.message,
                details: innerError.details,
            };
        }

        const originalError = innerError.debug.originalError;

        if (originalError instanceof AxiosError) {
            const status = originalError.status ?? 500;
            let message = originalError.message;
            let code: string | undefined;
            let details: unknown;

            const data = originalError.response?.data;

            if (isObject(data)) {
                if ('message' in data && typeof data.message === 'string') {
                    message = data.message;
                }

                if ('code' in data && typeof data.code === 'string') {
                    code = data.code;
                }

                if ('details' in data) {
                    details = data.details;
                }
            }

            return {status, message, code, details};
        }

        if (originalError instanceof AppError) {
            const message = originalError.message;
            const code = originalError.code ? String(originalError.code) : undefined;
            const details = originalError.details;

            return {status: innerError.status, message, code, details};
        }

        if (
            !(originalError instanceof TypeError) &&
            !(originalError instanceof ReferenceError) &&
            !(originalError instanceof SyntaxError)
        ) {
            return {status: innerError.status, message: innerError.message};
        }
    }

    return {
        status: 500,
        message: 'Internal server error',
    };
};

export const validateRequestBody = async (schema: z.ZodType, data: unknown): Promise<unknown> => {
    try {
        return await schema.parseAsync(data);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new PublicApiError('Validation error', {
                code: PUBLIC_API_ERRORS.VALIDATION_ERROR,
                details: error.issues,
            });
        }

        throw error;
    }
};
