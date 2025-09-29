import {AppError} from '@gravity-ui/nodekit';

export class PublicApiError extends AppError {}

export const PUBLIC_API_ERRORS = {
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    ENDPOINT_NOT_FOUND: 'ENDPOINT_NOT_FOUND',
    ACTION_CONFIG_NOT_FOUND: 'ACTION_CONFIG_NOT_FOUND',
    INVALID_API_VERSION_HEADER: 'INVALID_API_VERSION_HEADER',
} as const;
