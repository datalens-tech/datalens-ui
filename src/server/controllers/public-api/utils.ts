import type {Request} from '@gravity-ui/expresskit';
import {AppError} from '@gravity-ui/nodekit';
import {AxiosError} from 'axios';
import isObject from 'lodash/isObject';
import type z from 'zod/v4';
import {ZodError} from 'zod/v4';

import {ServerError} from '../../../shared/constants/error';
import {
    PUBLIC_API_LATEST_VERSION,
    PUBLIC_API_VERSION_HEADER,
    PUBLIC_API_VERSION_HEADER_LATEST_VALUE,
} from '../../components/public-api/constants';
import type {PublicApiVersion} from '../../components/public-api/types';
import {isPublicApiVersion} from '../../components/public-api/utils';
import {isGatewayError} from '../../utils/gateway';

import {PUBLIC_API_ERRORS, PublicApiError} from './constants';

// eslint-disable-next-line complexity
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

            case PUBLIC_API_ERRORS.INVALID_API_VERSION_HEADER: {
                return {status: 400, message, code};
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

        if (originalError instanceof ServerError) {
            const {status, message, code, details} = originalError;

            return {status, message, code, details};
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

export const parseRequestApiVersion = (req: Request): PublicApiVersion => {
    const versionHeader = req.headers[PUBLIC_API_VERSION_HEADER];

    if (versionHeader) {
        if (isPublicApiVersion(versionHeader)) {
            return versionHeader;
        }

        if (versionHeader === PUBLIC_API_VERSION_HEADER_LATEST_VALUE) {
            return PUBLIC_API_LATEST_VERSION;
        }
    }

    throw new PublicApiError(`Invalid or empty ${PUBLIC_API_VERSION_HEADER} header value`, {
        code: PUBLIC_API_ERRORS.INVALID_API_VERSION_HEADER,
    });
};
