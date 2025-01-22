import type {SdkConfig} from '@gravity-ui/sdk';
import {CancellablePromise} from '@gravity-ui/sdk';

const CANCEL_REQUEST_EVENT = 'sdk_cancel_request';

type ConcurrentId = string | undefined;

class SdkEvent extends EventTarget {
    cancelRequest(concurrentId: ConcurrentId) {
        this.dispatchEvent(new CustomEvent(CANCEL_REQUEST_EVENT, {detail: {concurrentId}}));
    }
}
const instance = new SdkEvent();

function subscribeCancelRequest(cb: (concurrentId: ConcurrentId) => void) {
    function subscribe(event: Event) {
        const customEvent = event as CustomEvent<{concurrentId: ConcurrentId}>;
        cb(customEvent.detail.concurrentId);
    }
    instance.addEventListener(CANCEL_REQUEST_EVENT, subscribe);
    function unsubscribe() {
        instance.removeEventListener(CANCEL_REQUEST_EVENT, subscribe);
    }
    return unsubscribe;
}

export function emitCancelRequest(concurrentId: ConcurrentId) {
    instance.cancelRequest(concurrentId);
}

type BeforeRequestArgs = {
    scope?: string;
    service?: string;
    action?: string;
};

export function initBeforeRequestDecorator(
    beforeRequest: (args: BeforeRequestArgs) => Promise<unknown>,
): SdkConfig['decorator'] {
    return (sdkActionFunc, scope, service, action) =>
        (...sdkActionFuncArgs) => {
            const requestOptions = sdkActionFuncArgs[1];
            const concurrentId = requestOptions?.concurrentId;
            let cancelled = false;
            let actionPromise: ReturnType<typeof sdkActionFunc>;
            let unsubscribe: ReturnType<typeof subscribeCancelRequest>;
            if (concurrentId) {
                unsubscribe = subscribeCancelRequest((emittedConcurrentId) => {
                    if (emittedConcurrentId === concurrentId) {
                        cancelled = true;
                    }
                });
            }
            return new CancellablePromise(
                beforeRequest({scope, service, action}).then(() => {
                    unsubscribe?.();
                    actionPromise = sdkActionFunc(...sdkActionFuncArgs);
                    if (cancelled) {
                        actionPromise.cancel();
                    }
                    return actionPromise;
                }),
                () => {
                    unsubscribe?.();
                    actionPromise?.cancel();
                    cancelled = true;
                },
            ).finally(() => {
                unsubscribe?.();
            });
        };
}
