import type {AppConfig, AppContext} from '@gravity-ui/nodekit';
import {crc32c} from '@node-rs/crc32';
import type {RequiredUriUrl} from 'request';
import type {RequestPromise, RequestPromiseOptions} from 'request-promise-native';
import requestPromise from 'request-promise-native';

import {Feature} from '../../../../../shared/types';
import {CacheClient} from '../../../cache-client';
import {config} from '../../constants';
import {hideSensitiveData} from '../utils';

import {RequestAxios} from './axios';

type RequestOptions = RequiredUriUrl &
    RequestPromiseOptions & {useCaching?: boolean; signal: AbortSignal};

type CachedRequestOptions = RequestOptions & {
    uri: string;
    ctx: AppContext;
    spCacheDuration: string | number | null;
};

const isCachedRequestOptions = (
    options: RequestOptions | CachedRequestOptions,
): options is CachedRequestOptions =>
    'useCaching' in options && Boolean(options.useCaching) && 'ctx' in options;

const {
    REQUEST_SIZE_LIMIT,
    ALL_REQUESTS_SIZE_LIMIT,
    REQUEST_SIZE_LIMIT_EXCEEDED,
    ALL_REQUESTS_SIZE_LIMIT_EXCEEDED,
} = config;

const CACHE_PREFIX = 'sp';

let cacheClient: CacheClient;

const requestWithPresets = requestPromise.defaults({
    transform: (body, response) => {
        if (
            typeof body === 'string' &&
            // Stat in qloud do no return content-type with code 204
            response.headers['content-type'] &&
            response.headers['content-type'].indexOf('application/json') > -1
        ) {
            try {
                response.body = JSON.parse(body);
            } catch (e) {
                response.body = body;
            }
        }

        return response;
    },
    useQuerystring: true,
    maxRedirects: 0,
    followAllRedirects: true,
});

export class Request {
    static init({
        cacheClientInstance,
        config: appConfig,
    }: {
        cacheClientInstance: CacheClient;
        config: AppConfig;
    }) {
        cacheClient = cacheClientInstance;
        RequestAxios.init({cacheClientInstance, config: appConfig});
    }

    static request({
        requestOptions,
        useCaching = false,
        requestControl,
        ctx,
    }: {
        requestOptions: RequestOptions | CachedRequestOptions;
        useCaching?: boolean;
        requestControl: {
            allBuffersLength: number;
        };
        ctx: AppContext;
    }) {
        const isEnabledServerFeature = ctx.get('isEnabledServerFeature');
        if (isEnabledServerFeature(Feature.UseAxiosRequest)) {
            return RequestAxios.request({
                requestOptions: requestOptions as Parameters<
                    typeof RequestAxios.request
                >[0]['requestOptions'],
                useCaching,
                requestControl,
            });
        }

        const {signal} = requestOptions;

        if (signal?.aborted === true) {
            throw new Error(signal.reason);
        }

        function dataLengthCheck(requestInstance: RequestPromise) {
            let bufferLength = 0;

            return function (chunk: Buffer | string) {
                const {length} = chunk;

                bufferLength += length;
                requestControl.allBuffersLength += length;

                if (
                    requestControl.allBuffersLength > ALL_REQUESTS_SIZE_LIMIT ||
                    bufferLength > REQUEST_SIZE_LIMIT
                ) {
                    // @ts-ignore we use internal API in this case
                    if (requestInstance._started === true) {
                        requestInstance.abort();
                    }

                    const error = new Error(
                        bufferLength > REQUEST_SIZE_LIMIT
                            ? REQUEST_SIZE_LIMIT_EXCEEDED
                            : ALL_REQUESTS_SIZE_LIMIT_EXCEEDED,
                    );

                    requestInstance.emit('error', error);
                }
            };
        }

        if (useCaching && isCachedRequestOptions(requestOptions)) {
            return this.cacheRequest({requestOptions, dataLengthCheck});
        } else {
            return this.directRequest({requestOptions, dataLengthCheck});
        }
    }

    static directRequest({
        requestOptions,
        dataLengthCheck,
    }: {
        requestOptions: RequestOptions;
        dataLengthCheck: (requestInstance: RequestPromise) => (data: Buffer | string) => void;
    }) {
        const requestInstance = requestWithPresets(requestOptions);
        return requestInstance.on('data', dataLengthCheck(requestInstance));
    }

    static cacheRequest({
        requestOptions,
        dataLengthCheck,
    }: {
        requestOptions: CachedRequestOptions;
        dataLengthCheck: (requestInstance: RequestPromise) => (data: Buffer | string) => void;
    }) {
        const {uri, ctx} = requestOptions;
        let {spCacheDuration, useCaching} = requestOptions;

        const durationTime = Math.floor(Number(spCacheDuration));
        const removingCondition = spCacheDuration && durationTime < 7;

        const maxValue = 5184000;

        if (
            spCacheDuration &&
            (!isFinite(durationTime) || durationTime < 0 || durationTime > maxValue)
        ) {
            ctx.logError('Cache duration invalid', {uri: hideSensitiveData(uri)});

            useCaching = false;
            spCacheDuration = null;
        }

        let dataHash;
        if (requestOptions.body || requestOptions.form) {
            try {
                if (requestOptions.body) {
                    dataHash = crc32c(JSON.stringify(requestOptions.body));
                } else if (requestOptions.form) {
                    dataHash = crc32c(JSON.stringify(requestOptions.form));
                }
            } catch (error) {
                ctx.logError('Failed to calculate data hash', error);
            }
        }

        let key = `${CACHE_PREFIX}:${hideSensitiveData(uri)}`;

        if (dataHash) {
            key += `:${dataHash}`;
        }

        const debugInfo = {
            url: key,
            fromCache: false,
        };

        const sequence = Promise.resolve();

        if (removingCondition) {
            sequence
                .then(() => {
                    return cacheClient.del({key});
                })
                .then(() => {
                    ctx.log('Cache value successfully removed', {key});
                })
                .catch(() => {
                    ctx.logError('Cache proxy deletion error', {key});
                });
        }

        const getData = (cacheServiceFailing: boolean) => {
            return this.directRequest({requestOptions, dataLengthCheck})
                .then((response) => {
                    if (useCaching && !removingCondition && !cacheServiceFailing) {
                        cacheClient
                            .set({key, value: response.body, ttl: durationTime})
                            .then(() => {
                                ctx.log('Cache set', {key, durationTime});
                            })
                            .catch((error) => {
                                ctx.logError('Cache set failed', error);
                            });
                    }

                    ctx.log('CACHE_SENDING_VALUE_DIRECTLY', {uri: hideSensitiveData(uri)});

                    return response.body;
                })
                .catch((error) => {
                    if (error.response) {
                        ctx.logError('Cache proxy request error', error);

                        throw error;
                    } else {
                        throw error;
                    }
                });
        };

        return sequence
            .then(() => {
                if (useCaching && spCacheDuration) {
                    ctx.log('Cache getting value...', {key});

                    return cacheClient.get({key});
                } else {
                    return null;
                }
            })
            .catch((error) => {
                ctx.logError('Cache service failed', error);

                return {status: CacheClient.NOT_OK};
            })
            .then((cacheResponse) => {
                const cacheResponseStatus = cacheResponse && cacheResponse.status;

                if (
                    cacheResponseStatus === CacheClient.OK &&
                    cacheResponse &&
                    'data' in cacheResponse
                ) {
                    debugInfo.fromCache = true;

                    ctx.log('Cache successfully recovered');

                    cacheResponse.data.debugInfo = debugInfo;

                    return cacheResponse.data;
                } else {
                    if (useCaching) {
                        ctx.log(
                            'Cache failed, requesting without cache',
                            cacheResponse ?? undefined,
                        );
                    } else {
                        ctx.log('Cache disabled, requesting without cache');
                    }

                    return getData(cacheResponseStatus === CacheClient.NOT_OK);
                }
            })
            .catch((error) => {
                ctx.logError('Cache proxy error', error);

                throw error;
            });
    }
}
