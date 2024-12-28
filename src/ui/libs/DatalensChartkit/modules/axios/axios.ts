import type {AxiosError} from 'axios';
import axios from 'axios';
import axiosRetry, {isRetryableError} from 'axios-retry';
import isNumber from 'lodash/isNumber';
import {sleep} from 'shared/modules';
import {showReadOnlyToast} from 'ui/utils/readOnly';

import type {ConcurrencyManagerInstance} from './axiosConcurrency';
import {concurrencyManager} from './axiosConcurrency';

let concurrencyManagerInstance: ConcurrencyManagerInstance;
let retryRequestInterceptorId: number;
let retryResponseInterceptorId: number;

const client = axios.create({
    withCredentials: true,
    // otherwise, /api/run may crash with an error:
    // Request header field X-XSRF-TOKEN is not allowed by Access-Control-Allow-Headers in preflight response.
    xsrfCookieName: '',
});

initConcurrencyManager(Infinity);

export function initConcurrencyManager(maxConcurrentRequests: number) {
    if (concurrencyManagerInstance !== undefined) {
        concurrencyManagerInstance.detach();
    }

    // in order for axios-retry and axios-concurrency to work correctly together, the interseptors added by axios-retry
    // should be added after the interseptors added by axios-concurrency, therefor below we remove earlier
    // added axios-retry interseptors and pass axiosInstance first to concurrencyManager then
    // in axiosRetry
    if (isNumber(retryRequestInterceptorId)) {
        client.interceptors.request.eject(retryRequestInterceptorId);
    }
    if (isNumber(retryResponseInterceptorId)) {
        client.interceptors.response.eject(retryResponseInterceptorId);
    }

    concurrencyManagerInstance = concurrencyManager(client, maxConcurrentRequests);

    const {requestInterceptorId, responseInterceptorId} = axiosRetry(client, {
        retries: 0,
        retryCondition: isRetryableError,
        retryDelay: () => 3000,
    });
    retryRequestInterceptorId = requestInterceptorId;
    retryResponseInterceptorId = responseInterceptorId;
}

client.interceptors.response.use(
    (data) => data,
    async (error) => {
        if (error?.response?.status === 451) {
            showReadOnlyToast();
        }

        if (
            isAxiosError(error) &&
            error.config &&
            error.response &&
            error.response.status === 498
        ) {
            let retryCount = error.config.headers['retry-count'] || 0;
            if (retryCount <= 3) {
                error.config.headers['retry-count'] = ++retryCount;

                await sleep(1000);
                return client.request(error.config);
            }
        }

        throw error;
    },
);

export default client;

export function isAxiosError(error: Error | AxiosError): error is AxiosError {
    return (error as AxiosError).isAxiosError;
}
