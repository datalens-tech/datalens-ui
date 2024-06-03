// based on https://github.com/bernawil/axios-concurrency/

import type {AxiosInstance, AxiosResponse, InternalAxiosRequestConfig} from 'axios';

type Handler = {
    request: InternalAxiosRequestConfig;
    resolver(value: unknown): void;
};

type Interceptors = {
    request: number;
    response: number;
};

export type ConcurrencyManagerInstance = {
    queue: Handler[];
    running: Handler[];
    shiftInitial: () => void;
    push: (reqHandler: Handler) => void;
    shift: () => void;
    requestHandler(req: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig>;
    responseHandler(res: AxiosResponse): AxiosResponse;
    responseErrorHandler(res: AxiosResponse): void;
    interceptors: Interceptors;
    detach(): void;
};

export const concurrencyManager = (
    axios: AxiosInstance,
    MAX_CONCURRENT = 10,
): ConcurrencyManagerInstance => {
    if (MAX_CONCURRENT < 1) {
        throw 'Concurrency Manager Error: minimun concurrent requests is 1';
    }
    const instance: ConcurrencyManagerInstance = {
        queue: [],
        running: [],
        shiftInitial: () => {
            setTimeout(() => {
                if (instance.running.length < MAX_CONCURRENT) {
                    instance.shift();
                }
            }, 0);
        },
        push: (reqHandler) => {
            instance.queue.push(reqHandler);
            instance.shiftInitial();
        },
        shift: () => {
            if (instance.queue.length) {
                const queued = instance.queue.shift();
                if (queued) {
                    if (queued.request.cancelToken && queued.request.cancelToken.reason) {
                        // the request was already cancelled - do not even start it, just forget it
                        instance.shift();
                        return;
                    }
                    queued.resolver(queued.request);
                    instance.running.push(queued);
                }
            }
        },
        // Use as interceptor. Queue outgoing requests
        requestHandler: (req) => {
            return new Promise((resolve) => {
                instance.push({request: req, resolver: resolve});
            });
        },
        // Use as interceptor. Execute queued request upon receiving a response
        responseHandler: (res) => {
            instance.running.shift();
            instance.shift();
            return res;
        },
        responseErrorHandler: (res) => {
            return Promise.reject(instance.responseHandler(res));
        },
        interceptors: {
            request: -1,
            response: -1,
        },
        detach: () => {
            if (instance.interceptors.request !== -1) {
                axios.interceptors.request.eject(instance.interceptors.request);
            }
            if (instance.interceptors.response !== -1) {
                axios.interceptors.response.eject(instance.interceptors.response);
            }
        },
    };
    // queue concurrent requests
    instance.interceptors.request = axios.interceptors.request.use(instance.requestHandler);
    instance.interceptors.response = axios.interceptors.response.use(
        instance.responseHandler,
        instance.responseErrorHandler,
    );
    return instance;
};
