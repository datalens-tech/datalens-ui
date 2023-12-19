import axios, {AxiosError} from 'axios';
// @ts-ignore
import {ConcurrencyManager as concurrencyManager} from 'axios-concurrency';
import axiosRetry, {isRetryableError} from 'axios-retry';
import isNumber from 'lodash/isNumber';
import {showReadOnlyToast} from 'ui/utils/readOnly';

let concurrencyManagerInstance: typeof concurrencyManager = null;

const client = axios.create({
    withCredentials: true,
    // otherwise, /api/run may crash with an error:
    // Request header field X-XSRF-TOKEN is not allowed by Access-Control-Allow-Headers in preflight response.
    xsrfCookieName: '',
});

initConcurrencyManager(Infinity);

export function initConcurrencyManager(maxConcurrentRequests: number) {
    if (concurrencyManagerInstance) {
        concurrencyManagerInstance.detach();
    }

    // in order for axios-retry and axios-concurrency to work correctly together, the interseptors added by axios-retry
    // should be added after the interseptors added by axios-concurrency, therefor below we remove earlier
    // added axios-retry interseptors and pass axiosInstance first to concurrencyManager then
    // in axiosRetry
    // @ts-ignore
    if (isNumber(client.retryRequestInterceptor)) {
        // @ts-ignore
        client.interceptors.request.eject(client.retryRequestInterceptor);
    }
    // @ts-ignore
    if (isNumber(client.retryResponseInterceptor)) {
        // @ts-ignore
        client.interceptors.response.eject(client.retryResponseInterceptor);
    }

    concurrencyManagerInstance = concurrencyManager(client, maxConcurrentRequests);

    axiosRetry(client, {
        retries: 0,
        retryCondition: isRetryableError,
        retryDelay: () => 3000,
    });

    // it is necessary to store the indexes of the positions of the interceptors added by axios-retry, to bring ability to delete them
    // @ts-ignore
    client.retryRequestInterceptor = client.interceptors.request.handlers.length - 1;
    // @ts-ignore
    client.retryResponseInterceptor = client.interceptors.response.handlers.length - 1;
}

client.interceptors.response.use(
    (data) => data,
    (error) => {
        if (error?.response?.status === 451) {
            showReadOnlyToast();
        }

        throw error;
    },
);

export default client;

export function isAxiosError(error: Error | AxiosError): error is AxiosError {
    return (error as AxiosError).isAxiosError;
}
