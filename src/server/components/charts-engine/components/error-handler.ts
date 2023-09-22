export class ExtendedError extends Error {
    handled?: boolean;
    code?: string;
    meta?: Record<string, unknown>;
}

// This error-handler working only with axios, because only axios has error.code
// eslint-disable-next-line no-unused-vars
export function createErrorHandler({meta = {}, rethrow = true}) {
    const defaultRetrhow = rethrow;
    const defaultMeta = meta;
    return function handleError({
        code = '',
        message: inputMessage = '',
        error: inputError,
        meta = {},
        rethrow = defaultRetrhow, // eslint-disable-line no-shadow
    }: {
        code?: string;
        message?: string;
        error?: ExtendedError;
        meta: Record<string, unknown>;
        rethrow?: boolean;
    }) {
        const message = inputMessage || code || 'EMPTY_ERROR_MESSAGE';
        const error = inputError || new ExtendedError(message);

        if (!error.handled) {
            error.handled = true;
            if (code) {
                if (error.code) {
                    meta.originalCode = error.code;
                }
                error.code = code;
            }
        }

        if (!error.meta) {
            error.meta = {};
        }
        error.meta = {...error.meta, ...meta, ...defaultMeta};

        if (rethrow) {
            throw error;
        }

        return error;
    };
}
