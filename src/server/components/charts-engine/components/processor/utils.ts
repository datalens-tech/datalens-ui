import {isObject, isString} from 'lodash';

import {ProcessorErrorResponse} from './types';

export function getMessageFromUnknownError(e: unknown) {
    return isObject(e) && 'message' in e && isString(e.message) ? e.message : '';
}

export function handleProcessorError(
    result: ProcessorErrorResponse | {error: string},
    options?: {debugInfo: boolean},
) {
    const resultCopy = {...result};

    if ('_confStorageConfig' in resultCopy) {
        delete resultCopy._confStorageConfig;
    }

    let statusCode = 500;

    if (isObject(result.error) && !options?.debugInfo) {
        const {error} = result;
        if ('debug' in error) {
            delete error.debug;
        }

        const {details} = error;

        if (details) {
            delete details.stackTrace;

            if (details.sources) {
                const {sources} = details;

                Object.keys(sources).forEach((source) => {
                    if (sources[source]) {
                        const {body} = sources[source];

                        if (body) {
                            delete body.debug;
                        }
                    }
                });
            }
        }
    }

    if (isObject(result.error) && result.error.statusCode) {
        statusCode = result.error.statusCode;

        delete result.error.statusCode;
    }

    return {statusCode, result};
}
