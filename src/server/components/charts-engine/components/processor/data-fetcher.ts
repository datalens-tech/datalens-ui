/* eslint-disable complexity */
import type {IncomingHttpHeaders, OutgoingHttpHeaders} from 'http';
import querystring from 'node:querystring';
import url from 'node:url';

import type {AppContext} from '@gravity-ui/nodekit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';
import {isObject, isString} from 'lodash';
import sizeof from 'object-sizeof';
import PQueue from 'p-queue';

import type {ChartsEngine} from '../..';
import type {WorkbookId} from '../../../../../shared';
import {
    DL_CONTEXT_HEADER,
    DL_EMBED_TOKEN_HEADER,
    Feature,
    SERVICE_USER_ACCESS_TOKEN_HEADER,
    SuperuserHeader,
    WORKBOOK_ID_HEADER,
} from '../../../../../shared';
import {registry} from '../../../../registry';
import type {CacheClient} from '../../../cache-client';
import {config} from '../../constants';
import type {AdapterContext, Source, SourceConfig, TelemetryCallbacks} from '../../types';
import {Request as RequestPromise} from '../request';
import {hideSensitiveData} from '../utils';

import {getApiConnectorParamsFromSource, isAPIConnectorSource, prepareSource} from './sources';
import {getMessageFromUnknownError} from './utils';

const {
    ALL_REQUESTS_SIZE_LIMIT_EXCEEDED,
    ALL_REQUESTS_TIMEOUT_EXCEEDED,
    CONCURRENT_REQUESTS_LIMIT,
    DEFAULT_FETCHING_TIMEOUT,
    DEFAULT_SINGLE_FETCHING_TIMEOUT,
    EMPTY_RESPONSE,
    INVALID_SOURCE_FORMAT,
    INVALID_SOURCES_FORMAT,
    REDACTED_DATA_PLACEHOLDER,
    REDIRECT,
    REQUEST_CANCELLED,
    REQUEST_SIZE_LIMIT_EXCEEDED,
    SOURCE_IS_CIRCULAR,
    UNHANDLED_INTERNAL_SERVER_ERROR,
    UNKNOWN_SOURCE,
} = config;

// https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html#sec5.1.1
const ALLOWED_HTTP_METHODS = ['GET', 'POST'];
const ALLOWED_REQUEST_FORMATS = ['json', 'form'];

type ChartkitSourceDecription = {title?: string};
type ChartkitSource = {
    description?: ChartkitSourceDecription;
    uiEndpoint?: string;
    dataEndpoint?: string;
};
type PromiseWithAbortController = [Promise<unknown>, AbortController];

type DataFetcherOptions = {
    sources: Record<string, Source | string>;
    ctx: AppContext;
    postprocess?:
        | ((
              data: Record<string, DataFetcherResult>,
              options?: Record<string, string>,
          ) => Record<string, DataFetcherResult>)
        | null;
    subrequestHeaders: Record<string, string>;
    userId?: string | null;
    userLogin?: string | null;
    iamToken?: string | null;
    workbookId?: WorkbookId;
    isEmbed?: boolean;
    zitadelParams?: ZitadelParams | undefined;
    authParams?: AuthParams | undefined;
    originalReqHeaders: DataFetcherOriginalReqHeaders;
    adapterContext: AdapterContext;
    telemetryCallbacks: TelemetryCallbacks;
    cacheClient: CacheClient;
    sourcesConfig: ChartsEngine['sources'];
};

export type DataFetcherOriginalReqHeaders = {
    xRealIP: IncomingHttpHeaders['x-real-ip'];
    xForwardedFor: IncomingHttpHeaders['x-forwarded-for'];
    xChartsFetcherVia: IncomingHttpHeaders['x-charts-fetcher-via'];
    referer: IncomingHttpHeaders['referer'];
};

type DataFetcherRequestOptions = {
    headers: OutgoingHttpHeaders;
    method: string;
    uri: string;
    timeout: number;
    spStatFormat: string | string[] | null;
    maxRedirects?: number;
    form?: string | Record<string, string | Record<string, unknown>>;
    body?: string | Record<string, string | Record<string, unknown>>;
    json?: boolean;
};

type SourceWithMiddlewareUrl = Source & Required<Pick<Source, 'middlewareUrl' | 'sourceArgs'>>;

function isSourceWithMiddlewareUrl(source: Source): source is SourceWithMiddlewareUrl {
    return isObject(source.middlewareUrl) && isObject(source.sourceArgs);
}

function getDatasetId(publicTargetUri?: string | Record<string, string>) {
    if (!publicTargetUri || typeof publicTargetUri !== 'string') {
        return null;
    }

    // [backend-api]/api/data/v1/datasets/[id]/versions/draft/result
    return publicTargetUri.split('/')[7];
}

function cancelRequestsPromises(
    requestsPromises: PromiseWithAbortController[],
    cancelCode: string,
    current?: Promise<unknown>,
) {
    requestsPromises.forEach((requestPromise: PromiseWithAbortController) => {
        if (requestPromise[0] === current) {
            return;
        }

        requestPromise[1].abort(cancelCode);
    });
}

function filterObjectWhitelist(source: Record<string, any>, whitelist?: string[]) {
    return whitelist
        ? Object.keys(source).reduce<Record<string, any>>((acc, key) => {
              if (whitelist.includes(key)) {
                  acc[key] = source[key];
              }
              return acc;
          }, {})
        : source;
}

const isFetchLimitError = (errorMessage: string) =>
    errorMessage === `Error: ${REQUEST_SIZE_LIMIT_EXCEEDED}` ||
    errorMessage === `Error: ${ALL_REQUESTS_SIZE_LIMIT_EXCEEDED}`;

export type DataFetcherResult = {
    sourceId: string;
    sourceType: string;
    body: unknown;
    responseHeaders: IncomingHttpHeaders;
    status: number;
    latency: number;
    size: number;
    uiUrl?: string;
    dataUrl?: string;
    datasetId: string;
    hideInInspector?: boolean;
    url: string;
    message?: string;
    code?: string;
    data?: any;
    details?: string;
};

export type ZitadelParams = {
    accessToken?: string;
    serviceUserAccessToken?: string;
};

export function addZitadelHeaders({
    headers,
    zitadelParams,
}: {
    headers: OutgoingHttpHeaders;
    zitadelParams: ZitadelParams;
}) {
    if (zitadelParams?.accessToken) {
        Object.assign(headers, {authorization: `Bearer ${zitadelParams.accessToken}`});
    }

    if (zitadelParams?.serviceUserAccessToken) {
        Object.assign(headers, {
            [SERVICE_USER_ACCESS_TOKEN_HEADER]: zitadelParams.serviceUserAccessToken,
        });
    }
}

export type AuthParams = {
    accessToken?: string;
};

export function addAuthHeaders({
    headers,
    authParams,
}: {
    headers: OutgoingHttpHeaders;
    authParams: AuthParams;
}) {
    if (authParams?.accessToken) {
        Object.assign(headers, {authorization: `Bearer ${authParams.accessToken}`});
    }
}

export class DataFetcher {
    static fetch({
        sources,
        ctx,
        postprocess = null,
        subrequestHeaders,
        userId,
        userLogin,
        iamToken,
        workbookId,
        isEmbed = false,
        zitadelParams,
        authParams,
        originalReqHeaders,
        adapterContext,
        telemetryCallbacks,
        cacheClient,
        sourcesConfig,
    }: DataFetcherOptions): Promise<Record<string, DataFetcherResult>> {
        const fetchingTimeout = ctx.config.fetchingTimeout || DEFAULT_FETCHING_TIMEOUT;

        const fetchingStartTime = Date.now();

        const processingRequests: PromiseWithAbortController[] = [];

        const overallTimeout = setTimeout(() => {
            cancelRequestsPromises(processingRequests, ALL_REQUESTS_TIMEOUT_EXCEEDED);
        }, fetchingTimeout);

        return new Promise((resolve, reject) => {
            if (typeof sources !== 'object' && sources !== null) {
                return reject({
                    code: INVALID_SOURCES_FORMAT,
                });
            }

            const queue = new PQueue({concurrency: CONCURRENT_REQUESTS_LIMIT});
            const fetchPromisesList: (() => unknown)[] = [];

            if (!originalReqHeaders || !adapterContext) {
                throw new Error('Missing original request headers or adapter context');
            }

            Object.keys(sources).forEach((sourceName) => {
                const source = sources[sourceName];

                fetchPromisesList.push(() =>
                    source
                        ? DataFetcher.fetchSource({
                              ctx,
                              sourceName,
                              source: isString(source) ? {url: source} : source,
                              fetchingStartTime,
                              subrequestHeaders,
                              processingRequests,
                              rejectFetchingSource: reject,
                              userId,
                              userLogin,
                              iamToken,
                              workbookId,
                              isEmbed,
                              zitadelParams,
                              authParams,
                              originalReqHeaders:
                                  originalReqHeaders as DataFetcherOriginalReqHeaders,
                              adapterContext: adapterContext as AdapterContext,
                              telemetryCallbacks,
                              cacheClient,
                              sourcesConfig,
                          })
                        : {
                              sourceId: sourceName,
                              sourceType: 'Invalid',
                              code: INVALID_SOURCE_FORMAT,
                          },
                );
            });

            queue
                .addAll(fetchPromisesList)
                .then((results) => {
                    const failed: Record<string, Record<string, string>> = {};
                    const fetched: Record<string, DataFetcherResult> = {};

                    clearTimeout(overallTimeout);

                    (results as DataFetcherResult[]).forEach((result) => {
                        Object.keys(result).forEach((key) => {
                            if ((result as Record<string, any>)[key] === null) {
                                delete (result as Record<string, any>)[key];
                            }
                        });
                        if (result.message || result.code) {
                            const entry: Record<string, any> = {
                                sourceType: result.sourceType,
                                status: result.status,
                                message: result.message,
                                code: result.code,
                                responseHeaders: result.responseHeaders,
                                uiUrl: result.uiUrl,
                                dataUrl: result.dataUrl,
                                data: result.data,
                                hideInInspector: result.hideInInspector,
                                /** @deprecated use uiUrl and dataUrl */
                                url: result.url,
                                details: result.details,
                            };

                            if (result.body) {
                                entry.body = result.body;
                            }

                            failed[result.sourceId] = filterObjectWhitelist(
                                entry,
                                ctx.config.runResponseWhitelist,
                            );
                        } else {
                            fetched[result.sourceId] = filterObjectWhitelist(
                                result,
                                ctx.config.runResponseWhitelist,
                            ) as DataFetcherResult;
                        }
                    });

                    if (Object.keys(failed).length) {
                        reject(failed);
                    } else if (postprocess) {
                        resolve(postprocess(fetched));
                    } else {
                        resolve(fetched);
                    }
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    static getSourceName(sourcePath: string) {
        return sourcePath.replace(/\/([^?/]+)(.|\n)*/g, '$1').slice(1);
    }

    /**
     * @param {String} chartsEngine
     * @param {String} sourcePath requested source
     *
     * @returns {Object} source configuration
     */
    static getSourceConfig({
        sourcesConfig,
        sourcePath,
        isEmbed,
    }: {
        sourcesConfig: ChartsEngine['sources'];
        sourcePath: string;
        isEmbed?: boolean;
    }) {
        let sourceName = DataFetcher.getSourceName(sourcePath);

        // Temporary hack for embed endpoints
        if (isEmbed && sourceName === 'bi_datasets') {
            sourceName = 'bi_datasets_embed';
        }
        if (isEmbed && sourceName === 'bi_connections') {
            sourceName = 'bi_connections_embed';
        }

        const resultSourceType = Object.keys(sourcesConfig).find((sourceType) => {
            if (sourceName === sourceType) {
                return true;
            }

            const aliases = sourcesConfig[sourceType].aliases;
            if (aliases) {
                return aliases.has(sourceName);
            }

            return false;
        });

        if (resultSourceType) {
            const sourceConfig = sourcesConfig[resultSourceType];

            sourceConfig.sourceType = resultSourceType;

            // Temporary hack for embed endpoints
            if (isEmbed && resultSourceType === 'bi_datasets_embed') {
                sourceConfig.sourceType = 'bi_datasets';
            }

            if (isEmbed && resultSourceType === 'bi_connections_embed') {
                sourceConfig.sourceType = 'bi_connections';
            }

            return sourceConfig;
        } else {
            return null;
        }
    }

    /**
     * @param {String} sourcesConfig
     * @param {String} lang target lang
     *
     * @returns {Object} config for all sources
     */
    static getChartKitSources({
        sourcesConfig,
        lang = 'en',
    }: {
        sourcesConfig: ChartsEngine['sources'];
        lang: 'en' | 'ru';
    }) {
        const sources = sourcesConfig;

        const chartkitSources: Record<string, ChartkitSource> = {};

        Object.keys(sources).forEach((sourceType) => {
            const chartkitSource: ChartkitSource = {};
            const source = sources[sourceType];

            if (source.description) {
                const chartkitSourceDescription: ChartkitSourceDecription = {};
                const description = source.description;

                if (description.title) {
                    chartkitSourceDescription.title = description.title[lang];
                }

                chartkitSource.description = chartkitSourceDescription;
            }

            if (source.uiEndpoint) {
                chartkitSource.uiEndpoint = source.uiEndpoint;
            }

            if (source.dataEndpoint) {
                chartkitSource.dataEndpoint = source.dataEndpoint;
            }

            chartkitSources[sourceType] = chartkitSource;

            if (source.aliases) {
                [...source.aliases].forEach((alias) => {
                    chartkitSources[alias] = chartkitSource;
                });
            }
        });

        return chartkitSources;
    }

    /**
     * @param {String} sourcePath requested source
     *
     * @returns {Boolean} check is source stat or not
     */
    static isStat({
        sourcesConfig,
        sourcePath,
    }: {
        sourcesConfig: ChartsEngine['sources'];
        sourcePath: string;
    }) {
        return DataFetcher.getSourceConfig({sourcesConfig, sourcePath}) === null;
    }

    private static removeFromProcessingRequests(
        promise: Promise<unknown>,
        processingRequests: PromiseWithAbortController[],
    ) {
        const index = processingRequests.findIndex((elem) => elem[0] === promise);

        processingRequests.splice(index, 1);
    }

    private static async fetchSource({
        sourceName,
        source,
        ctx,
        fetchingStartTime,
        subrequestHeaders,
        processingRequests,
        rejectFetchingSource,
        userId,
        userLogin,
        iamToken,
        workbookId,
        isEmbed,
        zitadelParams,
        authParams,
        originalReqHeaders,
        adapterContext,
        telemetryCallbacks,
        cacheClient,
        sourcesConfig,
    }: {
        sourceName: string;
        source: Source;
        ctx: AppContext;
        telemetryCallbacks: TelemetryCallbacks;
        fetchingStartTime: number;
        subrequestHeaders: Record<string, string>;
        processingRequests: PromiseWithAbortController[];
        rejectFetchingSource: () => void;
        userId?: string | null;
        userLogin?: string | null;
        iamToken?: string | null;
        workbookId?: WorkbookId;
        isEmbed: boolean;
        zitadelParams: ZitadelParams | undefined;
        authParams: AuthParams | undefined;
        originalReqHeaders: DataFetcherOriginalReqHeaders;
        adapterContext: AdapterContext;
        cacheClient: CacheClient;
        sourcesConfig: ChartsEngine['sources'];
    }) {
        const singleFetchingTimeout =
            ctx.config.singleFetchingTimeout || DEFAULT_SINGLE_FETCHING_TIMEOUT;

        const isEnabledServerFeature = ctx.get('isEnabledServerFeature');
        const isUseDataExportFieldEnabled = isEnabledServerFeature(Feature.EnableBackendExportInfo);

        try {
            source = prepareSource(source, isUseDataExportFieldEnabled);
        } catch (e) {
            return {
                sourceId: sourceName,
                sourceType: 'Unresolved',
                code: 'INVALID_SOURCE_CONFIG',
                details: getMessageFromUnknownError(e),
            };
        }

        const onDataFetched = telemetryCallbacks.onDataFetched || (() => {});
        const onDataFetchingFailed = telemetryCallbacks.onDataFetchingFailed || (() => {});

        const requestControl = {
            allBuffersLength: 0,
        };

        const hideInInspector = source.hideInInspector;

        let targetUri = source.url;

        const loggedSource = Object.assign({}, source, {
            data: REDACTED_DATA_PLACEHOLDER,
            sourceArgs: REDACTED_DATA_PLACEHOLDER,
            headers: REDACTED_DATA_PLACEHOLDER,
        });
        const loggedInfo: {sourceName: string; source: Source; login?: string} = {
            sourceName,
            source: loggedSource,
        };

        const useChartsEngineLogin = Boolean(isEnabledServerFeature(Feature.UseChartsEngineLogin));

        if (useChartsEngineLogin && userLogin) {
            loggedInfo.login = userLogin;
        }

        ctx.log('FETCHER_REQUEST', loggedInfo);

        if (typeof targetUri !== 'string' || !targetUri) {
            ctx.logError('FETCHER_UNKNOWN_SOURCE', null, {targetUri});

            return {
                sourceId: sourceName,
                sourceType: 'Unresolved',
                code: UNKNOWN_SOURCE,
            };
        }

        targetUri = targetUri.replace(/^\/_node/, '/_charts/_node');

        targetUri = targetUri.replace(/^\/api\/special\/traf/, '/_traf');

        targetUri = targetUri.replace(/^\/api\/wizard\/v1\/run/, '/_charts/api/wizard/v1/run');
        targetUri = targetUri.replace(/^\/api\/editor\/v1\/run/, '/_charts/api/editor/v1/run');
        targetUri = targetUri.replace(/^\/api\/run/, '/_charts/api/run');

        if (DataFetcher.isStat({sourcesConfig, sourcePath: targetUri})) {
            targetUri = '/_stat' + targetUri;
        }

        const parsedUrl = url.parse(targetUri);
        const parsedQuery = querystring.parse(parsedUrl.query || '');

        // https://www.w3.org/Protocols/rfc2616/rfc2616-sec5.html#sec5.1.1
        const sourceMethod = (source.method && source.method.toUpperCase()) || 'GET';
        const customHeaders = source.headers || {};

        if (!ALLOWED_HTTP_METHODS.includes(sourceMethod)) {
            const message = `This HTTP method is not allowed: ${sourceMethod}`;

            ctx.logError(message);

            return {
                sourceId: sourceName,
                sourceType: sourceName,
                message,
            };
        }

        const sourceCache = source.cache || parsedQuery['_sp_cache_duration'] || null;
        const sourceStatFormat = source.statFormat || parsedQuery['_sp_stat_format'] || null;

        let sourceFormat = source.format;
        if (sourceFormat === 'text') {
            sourceFormat = 'form';
        }

        if (!sourceFormat || !ALLOWED_REQUEST_FORMATS.includes(sourceFormat)) {
            sourceFormat = 'json';
        }

        const dataSourceName = DataFetcher.getSourceName(targetUri);

        const sourceConfig = DataFetcher.getSourceConfig({
            sourcesConfig,
            sourcePath: targetUri,
            isEmbed,
        });

        if (!sourceConfig) {
            ctx.logError(`Invalid source: ${targetUri}`);

            return {
                sourceId: sourceName,
                sourceType: 'Unresolved',
                code: INVALID_SOURCE_FORMAT,
            };
        }

        const {passedCredentials, extraHeaders, sourceType} = sourceConfig;

        if (
            sourceConfig.allowedMethods &&
            !sourceConfig.allowedMethods.includes(
                sourceMethod as 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
            )
        ) {
            const message = `This HTTP method (${sourceMethod}) is not allowed for this source: ${sourceName}`;

            ctx.logError(message);

            return {
                sourceId: sourceName,
                sourceType,
                message,
            };
        }

        if (sourceConfig.check) {
            const result = await sourceConfigCheck({
                ctx,
                targetUri,
                sourceConfig,
                sourceName,
                sourceType,
            });
            if (result.valid === false) {
                return result.meta;
            }
        }

        const useCaching = Boolean(sourceConfig.useCaching && sourceCache);

        const croppedTargetUri = targetUri.replace('/_' + sourceType, '');

        let userTargetUriUi: string | null = null;
        if (sourceConfig.uiEndpointFormatter) {
            userTargetUriUi = sourceConfig.uiEndpointFormatter(targetUri, source.data);
        } else if (sourceConfig.uiEndpoint) {
            userTargetUriUi = sourceConfig.uiEndpoint + croppedTargetUri;
        }

        if (sourceConfig.adapterWithContext) {
            return sourceConfig.adapterWithContext({
                targetUri: croppedTargetUri,
                sourceName,
                adapterContext,
                ctx,
            });
        }

        const headers: IncomingHttpHeaders = Object.assign(
            {},
            {
                'user-agent': 'Datalens Charts',
            },
            ctx.getMetadata(),
        );

        if (sourceType === 'charts') {
            const incomingHeader = originalReqHeaders.xChartsFetcherVia || '';

            const {reqBody} = ctx.get('sources');

            const scriptName = reqBody.params ? '/editor/' + reqBody.params.name : reqBody.path;

            if (incomingHeader && !Array.isArray(incomingHeader)) {
                const circular = incomingHeader.split(',').some((someScriptName) => {
                    return scriptName === someScriptName;
                });

                if (circular) {
                    ctx.logError('Source is circullar');
                    return {
                        sourceId: sourceName,
                        url: targetUri,
                        sourceType,
                        code: SOURCE_IS_CIRCULAR,
                    };
                }
            }

            headers['x-charts-fetcher-via'] = incomingHeader
                ? `${incomingHeader},${scriptName}`
                : scriptName;
        }

        if (originalReqHeaders.referer) {
            headers.referer = ctx.utils.redactSensitiveQueryParams(originalReqHeaders.referer);
        }

        const proxyHeaders = ctx.config.chartsEngineConfig.dataFetcherProxiedHeaders || [
            // fallback will be removed soon
            SuperuserHeader.XDlAllowSuperuser,
            SuperuserHeader.XDlSudo,
            DL_CONTEXT_HEADER,
            'x-dl-debug-mode',
            DL_EMBED_TOKEN_HEADER,
        ];
        if (Array.isArray(proxyHeaders)) {
            proxyHeaders.forEach((headerName) => {
                if (subrequestHeaders[headerName]) {
                    headers[headerName] = subrequestHeaders[headerName];
                }
            });
        }

        if (workbookId) {
            headers[WORKBOOK_ID_HEADER] = workbookId;
        }

        if (zitadelParams) {
            addZitadelHeaders({headers, zitadelParams});
        }

        if (authParams) {
            addAuthHeaders({headers, authParams});
        }

        if (passedCredentials) {
            const getSourceAuthorizationHeaders = registry.common.functions.get(
                'getSourceAuthorizationHeaders',
            );

            const sourceAuthorizationHeaders = getSourceAuthorizationHeaders({
                ctx,
                sourceConfig,
                subrequestHeaders,
            });

            Object.assign(headers, sourceAuthorizationHeaders);
        }

        if (extraHeaders) {
            if (typeof extraHeaders === 'function') {
                const extraHeadersResult = extraHeaders();

                Object.assign(headers, extraHeadersResult);
            } else if (typeof extraHeaders === 'object') {
                Object.assign(headers, extraHeaders);
            }
        }

        if (sourceConfig.args) {
            Object.assign(parsedQuery, sourceConfig.args);
        }

        delete parsedQuery['_sp_cache_duration'];
        delete parsedQuery['_sp_stat_format'];

        parsedUrl.query = querystring.stringify(parsedQuery);
        parsedUrl.search = parsedUrl.query ? '?' + parsedUrl.query : '';

        targetUri =
            sourceConfig.dataEndpoint + url.format(parsedUrl).replace('/_' + sourceType, '');

        const requestHeaders = Object.assign({}, customHeaders, headers);

        if (sourceConfig.preprocess) {
            targetUri = sourceConfig.preprocess(targetUri);
        }

        const requestOptions: DataFetcherRequestOptions = {
            method: sourceMethod,
            uri: targetUri,
            headers: requestHeaders,
            timeout: singleFetchingTimeout,
            spStatFormat: sourceStatFormat,
        };

        if (sourceConfig.maxRedirects) {
            requestOptions.maxRedirects = sourceConfig.maxRedirects;
        }

        if (useCaching) {
            Object.assign(requestOptions, {
                ctx,
                spCacheDuration: sourceCache,
                useCaching,
            });
        }

        requestOptions.headers['x-forwarded-for'] = originalReqHeaders.xForwardedFor;

        if (!requestOptions.headers['x-real-ip']) {
            requestOptions.headers['x-real-ip'] = originalReqHeaders.xRealIP;
        }

        if (isSourceWithMiddlewareUrl(source)) {
            const middlewareSourceConfig = DataFetcher.getSourceConfig({
                sourcesConfig,
                sourcePath: source.middlewareUrl.sourceName,
            });

            if (middlewareSourceConfig?.middlewareAdapter) {
                source = await middlewareSourceConfig.middlewareAdapter({
                    ctx,
                    source,
                    sourceName,
                    iamToken: iamToken ?? undefined,
                    workbookId,
                    cacheClient,
                    userId: userId === undefined ? null : userId,
                    rejectFetchingSource,
                    zitadelParams,
                    authParams,
                    requestHeaders: requestOptions.headers,
                });
            }
        }

        const sourceData = isAPIConnectorSource(source)
            ? {parameters: getApiConnectorParamsFromSource(source)}
            : (!isString(source) && source.data) || null;

        if (sourceData) {
            if (sourceFormat === 'form') {
                requestOptions.form = sourceData;
            } else {
                requestOptions.body = sourceData;

                if (typeof sourceData === 'object') {
                    requestOptions.json = true;
                }
            }
        }

        const publicTargetUri = hideSensitiveData(targetUri);
        const publicSourceData = hideSensitiveData(sourceData);

        const traceId = ctx.getTraceId();
        const tenantId = ctx.get('tenantId');

        return new Promise((fetchResolve) => {
            ctx.log('Fetching', {publicTargetUri, xRealIp: requestOptions.headers['x-real-ip']});

            if (useCaching) {
                ctx.log('Using caching', {publicTargetUri});
            }
            const abortController = new AbortController();
            const signal = abortController.signal;
            const currentRequest: Promise<void> = RequestPromise.request({
                requestOptions: {...requestOptions, signal},
                requestControl,
                useCaching,
            })
                // eslint-disable-next-line
                .catch((error) => {
                    if (signal.aborted) {
                        return;
                    }
                    const latency = new Date().getTime() - fetchingStartTime;

                    const statusCode = isFetchLimitError(error.message) ? 200 : error.statusCode;

                    onDataFetchingFailed(error, {
                        sourceName: dataSourceName,
                        statusCode,
                        requestId: ctx.get(REQUEST_ID_PARAM_NAME) || '',
                        latency,
                        traceId,
                        tenantId,
                        url: publicTargetUri,
                        userId: userId || '',
                    });

                    if (error.response) {
                        if (error.response.req) {
                            error.response.req.headers = ctx.utils.redactSensitiveHeaders(
                                error.response.req.headers,
                            );
                        }

                        if (error.response.request) {
                            error.response.request.headers = ctx.utils.redactSensitiveHeaders(
                                error.response.request.headers,
                            );
                        }
                    }

                    const invalidJsonResponse =
                        typeof error?.response?.body === 'string' &&
                        error?.response?.headers?.['content-type']?.includes('application/json');
                    if (invalidJsonResponse) {
                        error.response.body = '[INVALID BODY]';
                    }

                    if (error.statusCode) {
                        ctx.log(
                            `Fetching failed with response code: ${error.statusCode} ${publicTargetUri}`,
                        );

                        fetchResolve({
                            status: error.statusCode,
                            sourceId: sourceName,
                            sourceType,
                            message: `${error.statusCode}`.replace(
                                'ECONNABORTED',
                                'Network error (source processing timed out)',
                            ),
                            body: (error.response && error.response.body) || {},
                            uiUrl: userTargetUriUi,
                            dataUrl: publicTargetUri,
                            data: publicSourceData,
                            hideInInspector,
                            /** @deprecated use uiUrl or dataUrl */
                            url: userTargetUriUi || publicTargetUri,
                        });
                    } else {
                        ctx.logError(`Fetching failed unexpectedly ${publicTargetUri}`, error);

                        const errorMessage = error.message;
                        let errorCode = error.code;

                        if (isFetchLimitError(errorMessage)) {
                            errorCode = error.message.replace('Error: ', '');

                            let cancelCode = errorCode;

                            if (errorCode === REQUEST_SIZE_LIMIT_EXCEEDED) {
                                cancelCode = null;
                            }

                            cancelRequestsPromises(processingRequests, cancelCode, currentRequest);

                            fetchResolve({
                                sourceId: sourceName,
                                sourceType,
                                code: errorCode,
                                responseHeaders: (error.response && error.response.headers) || null,
                                uiUrl: userTargetUriUi,
                                dataUrl: publicTargetUri,
                                data: publicSourceData,
                                hideInInspector,
                                /** @deprecated use uiUrl or dataUrl */
                                url: userTargetUriUi || publicTargetUri,
                            });
                        } else {
                            fetchResolve({
                                sourceId: sourceName,
                                sourceType,
                                message: errorMessage,
                                code: errorCode,
                                status: (error.response && error.response.statusCode) || null,
                                responseHeaders: (error.response && error.response.headers) || null,
                                body: error.response && error.response.body,
                                uiUrl: userTargetUriUi,
                                dataUrl: publicTargetUri,
                                data: publicSourceData,
                                hideInInspector,
                                /** @deprecated use uiUrl or dataUrl */
                                url: userTargetUriUi || publicTargetUri,
                            });
                        }
                    }
                })
                .then((response) => {
                    if (response) {
                        let data = response.body || response;

                        const latency = new Date().getTime() - fetchingStartTime;

                        onDataFetched({
                            sourceName: dataSourceName,
                            statusCode: response.statusCode,
                            requestId: ctx.get(REQUEST_ID_PARAM_NAME) || '',
                            latency,
                            url: publicTargetUri,
                            traceId,
                            tenantId,
                            userId: userId || '',
                        });

                        if (response.statusCode === 204 && data === '') {
                            fetchResolve({
                                sourceId: sourceName,
                                sourceType,
                                status: response.statusCode,
                                code: EMPTY_RESPONSE,
                                responseHeaders: response.headers,
                                uiUrl: userTargetUriUi,
                                dataUrl: publicTargetUri,
                                data: publicSourceData,
                                hideInInspector,
                                /** @deprecated use uiUrl or dataUrl */
                                url: userTargetUriUi || publicTargetUri,
                            });
                        } else if (
                            response.statusCode === 301 ||
                            response.statusCode === 302 ||
                            response.statusCode === 307
                        ) {
                            fetchResolve({
                                sourceId: sourceName,
                                sourceType,
                                status: response.statusCode,
                                code: REDIRECT,
                                body: data,
                                responseHeaders: response.headers,
                                uiUrl: userTargetUriUi,
                                dataUrl: publicTargetUri,
                                data: publicSourceData,
                                hideInInspector,
                                /** @deprecated use uiUrl or dataUrl */
                                url: userTargetUriUi || publicTargetUri,
                            });
                        } else {
                            if (sourceConfig.postprocess) {
                                data = sourceConfig.postprocess(data, requestOptions);
                            }

                            const datasetId = getDatasetId(publicTargetUri);

                            fetchResolve({
                                sourceId: sourceName,
                                sourceType,
                                body: data,
                                responseHeaders: response.headers,
                                status: response.statusCode,
                                latency,
                                size: sizeof(data),
                                uiUrl: userTargetUriUi,
                                dataUrl: publicTargetUri,
                                datasetId,
                                hideInInspector,
                                data: publicSourceData,
                                /** @deprecated use uiUrl or dataUrl */
                                url: userTargetUriUi || publicTargetUri,
                            });
                        }
                    }
                })
                .catch((error) => {
                    ctx.logError('Unhandled internal fetcher error', error);
                    fetchResolve({
                        sourceId: sourceName,
                        sourceType,
                        code: UNHANDLED_INTERNAL_SERVER_ERROR,
                        uiUrl: userTargetUriUi,
                        dataUrl: publicTargetUri,
                        data: publicSourceData,
                        hideInInspector,
                        /** @deprecated use uiUrl or dataUrl */
                        url: userTargetUriUi || publicTargetUri,
                    });
                })
                .finally(() => {
                    if (signal.aborted) {
                        const code = signal.reason || REQUEST_CANCELLED;

                        fetchResolve({
                            sourceId: sourceName,
                            sourceType,
                            code,
                            uiUrl: userTargetUriUi,
                            dataUrl: publicTargetUri,
                            data: publicSourceData,
                            hideInInspector,
                            /** @deprecated use uiUrl or dataUrl */
                            url: userTargetUriUi || publicTargetUri,
                        });
                    }

                    DataFetcher.removeFromProcessingRequests(currentRequest, processingRequests);
                });

            processingRequests.push([currentRequest, abortController]);
        });
    }
}

type SourceCheckResult = {
    valid: boolean;
    meta?: {
        sourceId: string;
        sourceType?: string;
        message: string;
    };
};

async function sourceConfigCheck({
    ctx,
    sourceName,
    sourceType,
    sourceConfig,
    targetUri,
}: {
    ctx: AppContext;
    sourceName: string;
    sourceType?: string;
    sourceConfig: SourceConfig;
    targetUri: string;
}): Promise<SourceCheckResult> {
    if (!sourceConfig.check) {
        return {valid: true};
    }
    try {
        const checkResult = await sourceConfig.check(targetUri);
        if (checkResult === true) {
            ctx.log('Access to source allowed');
            return {valid: true};
        } else if (checkResult === false) {
            ctx.log('Access to source forbidden');

            return {
                valid: false,
                meta: {
                    sourceId: sourceName,
                    sourceType,
                    message: 'Access to source forbidden',
                },
            };
        } else {
            ctx.logError('Source access check failed');

            return {
                valid: false,
                meta: {
                    sourceId: sourceName,
                    sourceType,
                    message: 'Source access check failed',
                },
            };
        }
    } catch (error) {
        ctx.logError('Failed to run source check', error);

        return {
            valid: false,
            meta: {
                sourceId: sourceName,
                sourceType,
                message: 'Failed to run source check',
            },
        };
    }
}
