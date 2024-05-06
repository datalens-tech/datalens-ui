import {isObject, isString} from 'lodash';

import {UISandboxContext} from '../../../../../shared/constants/ui-sandbox';
import {UISandboxWrappedFunction} from '../../../../../shared/types/ui-sandbox';

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

type ValidatedWrapFnArgs = {
    fn: (...args: unknown[]) => void;
    ctx: UISandboxWrappedFunction['ctx'];
};

// There is a user value here, it could have any type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const isWrapFnArgsValid = (value: any): value is ValidatedWrapFnArgs => {
    if (!value || typeof value !== 'object') {
        throw new Error('You should pass an object to ChartEditor.wrapFn method');
    }

    const {fn, ctx} = value;

    if (typeof fn !== 'function') {
        throw new Error('"fn" property should be a function');
    }

    const availableCtxValues = Object.values(UISandboxContext);

    if (!Object.values(UISandboxContext).includes(ctx)) {
        throw new Error(`"ctx" property should be a string from list: ${availableCtxValues}`);
    }

    return true;
};
