import type {IncomingMessage, OutgoingHttpHeaders} from 'http';
import querystring from 'node:querystring';

import type {AppConfig, AppContext} from '@gravity-ui/nodekit';
import {crc32c} from '@node-rs/crc32';
import type {AxiosInstance, AxiosRequestConfig, RawAxiosRequestHeaders} from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import {DEFAULT_TIMEOUT} from '../../../../../shared/constants/timeout';
import {getAxios} from '../../../axios';
import {CacheClient} from '../../../cache-client';
import {config} from '../../constants';
import {hideSensitiveData} from '../utils';

type RequestOptions = Omit<AxiosRequestConfig, 'headers'> & {
    useCaching?: boolean;
    signal: AbortSignal;
    uri?: string; // Для обратной совместимости, мапится в url
    form?: unknown; // Для обратной совместимости
    json?: boolean; // Для обратной совместимости
    qs?: Record<string, unknown>; // Query string params
    body?: unknown; // Request body
    headers?: OutgoingHttpHeaders | RawAxiosRequestHeaders; // Support both Node.js and Axios headers
};

type CachedRequestOptions = RequestOptions & {
    uri: string;
    ctx: AppContext;
    spCacheDuration: string | number | null;
};

// Интерфейс для псевдо-объекта request instance (совместимость с dataLengthCheck)
interface RequestInstanceLike {
    abort: () => void;
    emit: (event: string, error: Error) => void;
    _started?: boolean;
}

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

// Типобезопасная конвертация OutgoingHttpHeaders в RawAxiosRequestHeaders
function normalizeHeaders(
    headers: OutgoingHttpHeaders | RawAxiosRequestHeaders | undefined,
): RawAxiosRequestHeaders | undefined {
    if (!headers) {
        return undefined;
    }

    const normalized: RawAxiosRequestHeaders = {};

    for (const [key, value] of Object.entries(headers)) {
        if (value === undefined) {
            continue;
        }

        // Конвертируем string[] в строку через join
        if (Array.isArray(value)) {
            normalized[key] = value.join(', ');
        } else if (typeof value === 'string' || typeof value === 'number') {
            normalized[key] = value;
        }
        // Пропускаем другие типы которые не поддерживаются Axios
    }

    return normalized;
}

export class Request {
    private static axiosInstance: AxiosInstance;

    static init({
        cacheClientInstance,
        config: appConfig,
    }: {
        cacheClientInstance: CacheClient;
        config?: AppConfig;
    }) {
        cacheClient = cacheClientInstance;

        if (appConfig) {
            this.axiosInstance = getAxios(appConfig);
        } else {
            // Fallback для обратной совместимости
            this.axiosInstance = axios.create({
                timeout: DEFAULT_TIMEOUT,
            });
            axiosRetry(this.axiosInstance, {retries: 0});
        }
    }

    static request({
        requestOptions,
        useCaching = false,
        requestControl,
    }: {
        requestOptions: RequestOptions | CachedRequestOptions;
        useCaching?: boolean;
        requestControl: {
            allBuffersLength: number;
        };
    }) {
        const {signal} = requestOptions;

        if (signal?.aborted === true) {
            throw new Error(signal.reason);
        }

        function dataLengthCheck(requestInstance: RequestInstanceLike) {
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
        dataLengthCheck: (requestInstance: RequestInstanceLike) => (data: Buffer | string) => void;
    }) {
        const axiosConfig: AxiosRequestConfig = {
            ...this.mapRequestOptions(requestOptions),
            responseType: 'stream',
            signal: requestOptions.signal,
        };

        return this.axiosInstance
            .request<IncomingMessage>(axiosConfig)
            .then((response) => {
                const stream = response.data;
                const chunks: Buffer[] = [];

                // Создаём псевдо-объект для callback совместимости
                const requestInstance: RequestInstanceLike = {
                    abort: () => stream.destroy(),
                    emit: (event: string, error: Error) => {
                        if (event === 'error') {
                            stream.destroy(error);
                        }
                    },
                    _started: true, // Для совместимости с dataLengthCheck
                };

                const onData = dataLengthCheck(requestInstance);

                return new Promise<{
                    statusCode: number;
                    body: unknown;
                    headers: Record<string, unknown>;
                }>((resolve, reject) => {
                    stream.on('data', (chunk: Buffer) => {
                        chunks.push(chunk);
                        try {
                            onData(chunk);
                        } catch (error) {
                            // dataLengthCheck бросил ошибку о превышении лимита
                            const errorMessage = (error as Error).message;
                            if (
                                errorMessage === REQUEST_SIZE_LIMIT_EXCEEDED ||
                                errorMessage === ALL_REQUESTS_SIZE_LIMIT_EXCEEDED
                            ) {
                                // Оборачиваем в "Error: " для совместимости с isFetchLimitError()
                                const wrappedError = Object.assign(
                                    new Error(`Error: ${errorMessage}`),
                                    {code: errorMessage},
                                );
                                stream.destroy();
                                reject(wrappedError);
                            } else {
                                stream.destroy();
                                reject(error);
                            }
                        }
                    });

                    stream.on('end', () => {
                        const buffer = Buffer.concat(chunks);
                        const body = this.parseResponse(buffer, response.headers);

                        // Создаём response в формате request-promise
                        const result = {
                            statusCode: response.status,
                            body,
                            headers: response.headers,
                        };

                        resolve(result);
                    });

                    stream.on('error', (error) => {
                        reject(error);
                    });
                });
            })
            .catch((error) => {
                throw this.normalizeError(error);
            });
    }

    static cacheRequest({
        requestOptions,
        dataLengthCheck,
    }: {
        requestOptions: CachedRequestOptions;
        dataLengthCheck: (requestInstance: RequestInstanceLike) => (data: Buffer | string) => void;
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

    // Маппинг опций request → axios
    private static mapRequestOptions(options: RequestOptions): AxiosRequestConfig {
        const axiosConfig: AxiosRequestConfig = {
            url: options.uri || options.url,
            method: options.method,
            headers: normalizeHeaders(options.headers),
            timeout: options.timeout,
            maxRedirects: 0,
        };

        // Body handling
        if (options.body !== undefined) {
            axiosConfig.data = options.body;
        }

        // Form data handling
        if (options.form !== undefined) {
            axiosConfig.data =
                typeof options.form === 'string'
                    ? options.form
                    : querystring.stringify(
                          options.form as Record<string, string | number | boolean>,
                      );
            axiosConfig.headers = {
                ...axiosConfig.headers,
                'content-type': 'application/x-www-form-urlencoded',
            };
        }

        // Query params
        if (options.qs) {
            axiosConfig.params = options.qs;
        }

        return axiosConfig;
    }

    // Парсинг response body (JSON auto-detection)
    private static parseResponse(buffer: Buffer, headers: Record<string, unknown>): unknown {
        const body = buffer.toString('utf-8');
        const contentType = headers['content-type'];

        if (
            typeof body === 'string' &&
            // Stat in qloud do no return content-type with code 204
            typeof contentType === 'string' &&
            contentType.indexOf('application/json') > -1
        ) {
            try {
                return JSON.parse(body);
            } catch (e) {
                return body;
            }
        }

        return body;
    }

    // Нормализация ошибок axios → request-promise формат
    private static normalizeError(error: unknown): Error & {
        statusCode?: number;
        response?: {
            statusCode: number;
            body: unknown;
            headers: Record<string, string>;
        };
    } {
        if (axios.isAxiosError(error)) {
            const normalized = Object.assign(new Error(error.message), {
                statusCode: error.response?.status,
                code: error.code,
                stack: error.stack,
                response: error.response
                    ? {
                          statusCode: error.response.status,
                          body: error.response.data,
                          headers: error.response.headers as Record<string, string>,
                      }
                    : undefined,
            });

            return normalized;
        }

        if (error instanceof Error) {
            return error;
        }

        return new Error(String(error));
    }
}
