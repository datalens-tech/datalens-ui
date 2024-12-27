import type {CancelToken} from 'axios';
import axios from 'axios';

import logger from '../libs/logger';
import {getSdk} from '../libs/schematic-sdk';

interface Operation<M = any, R = any> {
    metadata: M;
    done: boolean;
    response?: R;
    error?: unknown;
}

interface WaitOperationOptions<O extends Operation> {
    operation: O;
    loader: (loaderOpts: {
        operation: O;
        cancelToken: CancelToken;
        concurrentId: string;
    }) => Promise<O>;
    timeout?: number;
    interval?: number;
}
interface WaitOperationResult<O extends Operation> {
    promise: Promise<InferOperationResponse<O>>;
    cancel: () => void;
}
type InferOperationResponse<T> = T extends Operation<any, infer R> ? R : any;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function waitOperation<O extends Operation>({
    operation: initialOperation,
    loader,
    timeout = 60 * 60 * 1000,
    interval = 1000,
}: WaitOperationOptions<O>): WaitOperationResult<O> {
    const cancelSource = axios.CancelToken.source();
    const cancelToken = cancelSource.token;
    const concurrentId = getSdk().sdk.getConcurrentId();
    let cancelOperation: () => void;
    let timeouted = false;
    let cancelled = false;

    function createCancelOperation(reject: (reason: string) => void) {
        return function () {
            cancelled = true;
            reject('cancel');
        };
    }

    const timeoutPromise = sleep(timeout).then(() => {
        logger.logError('waitOperation: timeout has occurred');
        timeouted = true;
        return Promise.reject('timeout');
    });
    const cancellationPromise = new Promise((_resolve, reject) => {
        cancelOperation = createCancelOperation(reject);
    });
    const operationPromise = (async () => {
        let operation = initialOperation;

        try {
            while (!operation.done) {
                if (timeouted || cancelled) {
                    break;
                }

                operation = await loader({operation, cancelToken, concurrentId});

                if (!operation.done) {
                    await sleep(interval);
                }
            }
        } catch (error) {
            if (axios.isCancel(error)) {
                return Promise.reject('cancel');
            } else {
                logger.logError('waitOperation: loader failed');
                return Promise.reject(error);
            }
        }

        if (operation && operation.error) {
            logger.logError('waitOperation: operation.error');
            return Promise.reject(operation.error);
        } else if (operation) {
            return Promise.resolve(operation?.response);
        } else {
            logger.logError('waitOperation: operation not defined');
            return Promise.reject();
        }
    })();

    return {
        promise: Promise.race([timeoutPromise, cancellationPromise, operationPromise]) as Promise<
            InferOperationResponse<O>
        >,
        cancel: function () {
            cancelOperation();
            cancelSource.cancel();
            getSdk().cancelRequest(concurrentId);
        },
    };
}
