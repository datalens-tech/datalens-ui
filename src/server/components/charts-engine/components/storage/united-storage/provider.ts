import type {IncomingHttpHeaders} from 'http';

import type {Request} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import type {AxiosRequestConfig} from 'axios';
import axios from 'axios';
import axiosRetry from 'axios-retry';

import type {
    EntryAnnotation,
    EntryPublicAuthor,
    TenantSettings,
    WorkbookId,
} from '../../../../../../shared';
import {
    AuthHeader,
    DL_COMPONENT_HEADER,
    DL_CONTEXT_HEADER,
    DL_EMBED_TOKEN_HEADER,
    EntryUpdateMode,
    FORWARDED_FOR_HEADER,
    PROJECT_ID_HEADER,
    SERVICE_USER_ACCESS_TOKEN_HEADER,
    SuperuserHeader,
    TENANT_ID_HEADER,
    TRACE_ID_HEADER,
    US_PUBLIC_API_TOKEN_HEADER,
    WORKBOOK_ID_HEADER,
    mapChartsConfigToLatestVersion,
} from '../../../../../../shared';
import {ErrorCode, TIMEOUT_10_SEC} from '../../../../../../shared/constants';
import {createErrorHandler} from '../../error-handler';
import {getDuration} from '../../utils';
import type {ChartEntryData, DashEntryData, EmbeddingInfo} from '../types';

const handleError = createErrorHandler({
    meta: {
        tags: {
            component: 'storage',
        },
    },
});

axiosRetry(axios, {
    retries: 2,
    retryDelay: (retryCount) => {
        return 50 * retryCount;
    },
});

const ENTRY_NOT_FOUND = 'ENTRY_NOT_FOUND';
const PASSED_PROPERTIES: (keyof Entry)[] = [
    'entryId',
    'data',
    'key',
    'links',
    'meta',
    'permissions',
    'scope',
    'type',
    'public',
    'isFavorite',
    'revId',
    'savedId',
    'publishedId',
    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',
    'workbookId',
    'servicePlan',
    'tenantFeatures',
    'tenantSettings',
    'annotation',
];

export type Entry = {
    entryId?: string;
    meta?: {
        entryId: string;
        key: string;
        stype?: string;
    };
    key?: string;
    type?: string;
    data?: unknown;
    links?: unknown;
    permissions?: {execute: boolean; read: boolean; edit: boolean; admin: boolean};
    scope?: string;
    public?: false;
    isFavorite?: undefined;
    revId?: string;
    savedId?: string;
    publishedId?: string;
    createdAt?: string;
    createdBy?: string;
    unversionedData?: {
        publicAuthor?: EntryPublicAuthor;
    };
    updatedAt?: string;
    updatedBy?: string;
    workbookId?: WorkbookId;
    servicePlan?: string;
    tenantFeatures?: Record<string, unknown>;
    tenantSettings?: TenantSettings;
    annotation?: EntryAnnotation;
};

const PASSED_HEADERS = [
    // Auth for domain
    AuthHeader.Cookie,

    // Auth with OAuth token
    AuthHeader.Authorization,

    // For correct Blackbox-auth on *.yandex.net
    'x-origin-host',

    SuperuserHeader.XDlAllowSuperuser,
    SuperuserHeader.XDlSudo,

    DL_CONTEXT_HEADER,

    US_PUBLIC_API_TOKEN_HEADER,

    FORWARDED_FOR_HEADER,

    TRACE_ID_HEADER,

    // Token for embedded charts
    DL_EMBED_TOKEN_HEADER,

    DL_COMPONENT_HEADER,
];

const DEFAULT_MAX_BODY_LENGTH = 15 * 1024 * 1024; // 100 MB
const DEFAULT_MAX_CONTENT_LENGTH = 15 * 1024 * 1024; // 100 MB

function formatPassedHeaders(
    headers: Request['headers'],
    ctx: AppContext,
    extraAllowedHeaders?: string[],
) {
    const headersNew: Request['headers'] = {};

    const {headersMap} = ctx.config;

    const passedHeaders = [
        ...PASSED_HEADERS,

        headersMap.folderId,
        headersMap.subjectToken,
        PROJECT_ID_HEADER,
        TENANT_ID_HEADER,
        SERVICE_USER_ACCESS_TOKEN_HEADER,
        ...(extraAllowedHeaders || []),
    ];

    if (headers) {
        passedHeaders.forEach((name) => {
            if (headers[name]) {
                headersNew[name] = headers[name];
            }
        });
    }

    return headersNew;
}

function formatPassedProperties(entry: Entry = {}) {
    // These fallbacks are needed to work with some old entities migrated to the US from the conf repository
    const entryId: string | undefined = (entry.meta || {}).entryId || entry.entryId;
    const workbookId: string | null | undefined = entry.workbookId;
    const key: string | undefined = entry.key || (entry.meta || {}).key;
    const type: string | undefined = (entry.meta || {}).stype || entry.type;
    const publicAuthor = entry.unversionedData?.publicAuthor;

    const formattedData: Record<string, unknown> = {};
    PASSED_PROPERTIES.forEach((field) => {
        formattedData[field] = entry[field];
    });

    // It's better not to remove this, a lot of things are tied to this meta format
    const meta = {
        ...entry.meta,
        stype: type,
        owner: entry.createdBy,
    };

    formattedData.entryId = entryId;
    formattedData.workbookId = workbookId;
    formattedData.key = key;
    formattedData.type = type;
    formattedData.meta = meta;

    // unversioned data
    if (publicAuthor) {
        formattedData.publicAuthor = publicAuthor;
    }

    return formattedData as DashEntryData | ChartEntryData;
}

let storageEndpoint: string;

export type ProviderUpdateParams = {
    entryId: string;
    revId?: string;
    data?: unknown;
    type?: unknown;
    mode?: string;
    links?: unknown;
    meta?: Record<string, string>;
    headers: Request['headers'];
    skipSyncLinks?: boolean;
    description?: string;
};

export type ProviderCreateParams = {
    key: string;
    data: unknown;
    type: unknown;
    scope: unknown;
    links?: unknown;
    headers: Request['headers'];
    recursion?: boolean;
    meta?: Record<string, string>;
    includePermissionsInfo?: boolean | string;
    workbookId: string | null;
    name: string;
    mode?: EntryUpdateMode;
    description?: string;
};

function injectMetadata(headers: IncomingHttpHeaders, ctx: AppContext): IncomingHttpHeaders {
    const metadata = ctx.getMetadata();
    return {...headers, ...metadata};
}

export class USProvider {
    static errors = {
        ENTRY_NOT_FOUND,
    };

    static init({endpoint, requestIdHeaderName}: {endpoint: string; requestIdHeaderName: string}) {
        storageEndpoint = endpoint;

        PASSED_HEADERS.push(requestIdHeaderName);
    }

    static retrieveById(
        ctx: AppContext,
        {
            id,
            revId,
            unreleased,
            includeLinks,
            includePermissionsInfo,
            includeServicePlan,
            includeTenantFeatures,
            headers,
            storageApiPath,
            extraAllowedHeaders,
            workbookId,
        }: {
            id: string;
            storageApiPath?: string;
            extraAllowedHeaders?: string[];
            unreleased: boolean | string;
            includeLinks?: boolean | string;
            includePermissionsInfo?: boolean | string;
            revId?: string;
            headers: Request['headers'];
            workbookId?: WorkbookId;
            includeServicePlan?: boolean;
            includeTenantFeatures?: boolean;
        },
    ) {
        const hrStart = process.hrtime();

        const params: {
            branch: 'saved' | 'published';
            includeLinks?: boolean;
            includePermissionsInfo?: boolean;
            revId?: string;
            includeServicePlan?: boolean;
            includeTenantFeatures?: boolean;
            includeFavorite?: boolean;
            includeTenantSettings: boolean;
        } = {
            branch: unreleased ? 'saved' : 'published',
            includeFavorite: true,
            includeTenantSettings: true,
        };

        if (includeServicePlan) {
            params.includeServicePlan = true;
        }

        if (includeTenantFeatures) {
            params.includeTenantFeatures = true;
        }

        if (includeLinks) {
            params.includeLinks = true;
        }

        if (includePermissionsInfo) {
            params.includePermissionsInfo = true;
        }

        if (revId) {
            params.revId = revId;
        }
        const formattedHeaders = formatPassedHeaders(headers, ctx, extraAllowedHeaders);

        if (workbookId) {
            formattedHeaders[WORKBOOK_ID_HEADER] = workbookId;
        }

        const axiosArgs: AxiosRequestConfig = {
            url: storageApiPath
                ? `${storageEndpoint}${storageApiPath}/${id}`
                : `${storageEndpoint}/v1/entries/${id}`,
            method: 'get',
            headers: injectMetadata(formattedHeaders, ctx),
            params,
            timeout: TIMEOUT_10_SEC,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_CONFIG_LOADED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.description = id;
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.description = id;
                    error.code = ErrorCode.EntryForbidden;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_RETRIEVE_ERROR',
                        meta: {extra: {id}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static async retrieveParsedWizardChart(
        ctx: AppContext,
        props: {
            id: string;
            storageApiPath?: string;
            extraAllowedHeaders?: string[];
            unreleased: boolean | string;
            includeLinks?: boolean | string;
            includePermissionsInfo?: boolean | string;
            revId?: string;
            headers: Request['headers'];
            workbookId?: WorkbookId;
            includeServicePlan?: boolean;
            includeTenantFeatures?: boolean;
        },
    ) {
        const result = await USProvider.retrieveById(ctx, props);

        result.data = mapChartsConfigToLatestVersion(JSON.parse(result.data.shared)) as any;

        return result;
    }

    static retrieveByKey(
        ctx: AppContext,
        {
            key,
            unreleased,
            includeLinks,
            includePermissionsInfo,
            headers,
        }: {
            key: string;
            unreleased: boolean | string;
            includeLinks?: boolean | string;
            includePermissionsInfo?: boolean | string;
            headers: Request['headers'];
        },
    ) {
        const hrStart = process.hrtime();

        const params: {
            key: string;
            branch: 'saved' | 'published';
            includeLinks?: boolean;
            includePermissionsInfo?: boolean;
        } = {
            key: key.replace(/^\//, ''),
            branch: unreleased ? 'saved' : 'published',
        };

        if (includeLinks) {
            params.includeLinks = true;
        }

        if (includePermissionsInfo) {
            params.includePermissionsInfo = true;
        }

        const formattedHeaders = formatPassedHeaders(headers, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/entriesByKey`,
            method: 'get',
            headers: injectMetadata(formattedHeaders, ctx),
            params,
            timeout: TIMEOUT_10_SEC,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_CONFIG_LOADED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.description = key;
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.description = key;
                    error.code = ErrorCode.EntryForbidden;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_RETRIEVE_ERROR',
                        meta: {extra: {key}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static retrieveByToken(
        ctx: AppContext,
        {
            token,
            headers,
            includeServicePlan,
            includeTenantFeatures,
        }: {
            token: string;
            headers: Request['headers'];
            includeServicePlan?: boolean;
            includeTenantFeatures?: boolean;
        },
    ): Promise<EmbeddingInfo> {
        const hrStart = process.hrtime();
        const headersWithToken = {
            ...headers,
            [DL_EMBED_TOKEN_HEADER]: token,
        };
        const params: {
            includeServicePlan?: boolean;
            includeTenantFeatures?: boolean;
            includeTenantSettings: boolean;
        } = {includeTenantSettings: true};

        if (includeServicePlan) {
            params.includeServicePlan = true;
        }

        if (includeTenantFeatures) {
            params.includeTenantFeatures = true;
        }
        const formattedHeaders = formatPassedHeaders(headersWithToken, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/embedded-entry`,
            method: 'get',
            headers: injectMetadata(formattedHeaders, ctx),
            timeout: TIMEOUT_10_SEC,
            params,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_CONFIG_LOADED', {duration: getDuration(hrStart)});

                return {
                    token: response.data.token,
                    embed: response.data.embed,
                    entry: formatPassedProperties(response.data.entry),
                };
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.description = 'embedToken';
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.description = 'embedToken';
                    error.code = ErrorCode.EntryForbidden;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_RETRIEVE_ERROR',
                        meta: {extra: {type: 'embedToken'}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static retrieveByTokenAndId(
        ctx: AppContext,
        {
            id,
            token,
            headers,
            includeServicePlan,
            includeTenantFeatures,
        }: {
            id: string;
            token: string;
            headers: Request['headers'];
            includeServicePlan?: boolean;
            includeTenantFeatures?: boolean;
        },
    ): Promise<EmbeddingInfo> {
        const hrStart = process.hrtime();
        const headersWithToken = {
            ...headers,
            [DL_EMBED_TOKEN_HEADER]: token,
        };
        const params: {
            includeServicePlan?: boolean;
            includeTenantFeatures?: boolean;
            includeTenantSettings: boolean;
        } = {includeTenantSettings: true};

        if (includeServicePlan) {
            params.includeServicePlan = true;
        }

        if (includeTenantFeatures) {
            params.includeTenantFeatures = true;
        }

        const formattedHeaders = formatPassedHeaders(headersWithToken, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/embeds/entries/${id}`,
            method: 'get',
            headers: injectMetadata(formattedHeaders, ctx),
            timeout: TIMEOUT_10_SEC,
            params,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_CONFIG_LOADED', {duration: getDuration(hrStart)});

                return {
                    token: response.data.embeddingInfo.token,
                    embed: response.data.embeddingInfo.embed,
                    entry: formatPassedProperties(response.data),
                };
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.description = 'embedToken and id';
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.description = 'embedToken and id';
                    error.code = ErrorCode.EntryForbidden;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_RETRIEVE_ERROR',
                        meta: {extra: {type: 'embedToken and id'}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static create(
        ctx: AppContext,
        {
            key,
            data,
            type,
            scope,
            links,
            headers,
            recursion = true,
            meta = {},
            includePermissionsInfo,
            workbookId,
            name,
            mode = EntryUpdateMode.Publish,
            description,
        }: ProviderCreateParams,
    ) {
        const hrStart = process.hrtime();

        const postedData: {
            key: string;
            data: unknown;
            scope: unknown;
            type: unknown;
            recursion: boolean;
            links?: unknown;
            meta: Record<string, string>;
            workbookId: string | null;
            name: string;
            includePermissionsInfo?: boolean;
            mode: EntryUpdateMode;
            description?: string;
        } = {
            key,
            data,
            scope,
            type,
            recursion,
            meta,
            workbookId,
            name,
            mode,
        };

        if (links) {
            postedData.links = links;
        }

        if (includePermissionsInfo) {
            postedData.includePermissionsInfo = true;
        }

        if (description) {
            postedData.description = description;
        }

        const formattedHeaders = formatPassedHeaders(headers, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/entries`,
            method: 'post',
            headers: injectMetadata(formattedHeaders, ctx),
            data: postedData,
            timeout: TIMEOUT_10_SEC,
            maxBodyLength: DEFAULT_MAX_BODY_LENGTH,
            maxContentLength: DEFAULT_MAX_CONTENT_LENGTH,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_OBJECT_CREATED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.code = ErrorCode.EntryForbidden;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_CREATE_ERROR',
                        meta: {extra: {key}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static update(
        ctx: AppContext,
        {
            entryId,
            revId,
            data,
            type,
            mode = 'save',
            links,
            meta = {},
            headers,
            skipSyncLinks,
            description,
        }: ProviderUpdateParams,
    ) {
        const hrStart = process.hrtime();

        const postedData: {
            mode: string;
            meta: Record<string, string>;
            revId?: string;
            data?: unknown;
            type?: unknown;
            links?: unknown;
            skipSyncLinks?: boolean;
            description?: string;
        } = {
            mode,
            meta,
        };

        if (revId) {
            postedData.revId = revId;
        }

        if (data) {
            postedData.data = data;
        }

        if (type) {
            postedData.type = type;
        }

        if (links) {
            postedData.links = links;
        }

        if (skipSyncLinks) {
            postedData.skipSyncLinks = true;
        }

        if (description) {
            postedData.description = description;
        }

        const formattedHeaders = formatPassedHeaders(headers, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/entries/${entryId}`,
            method: 'post',
            headers: injectMetadata(formattedHeaders, ctx),
            data: postedData,
            timeout: TIMEOUT_10_SEC,
            maxBodyLength: DEFAULT_MAX_BODY_LENGTH,
            maxContentLength: DEFAULT_MAX_CONTENT_LENGTH,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_OBJECT_UPDATED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.code = ErrorCode.EntryForbidden;
                    error.status = 403;
                    throw error;
                } else {
                    throw handleError({
                        code: 'UNITED_STORAGE_OBJECT_UPDATE_ERROR',
                        meta: {extra: {entryId}},
                        error,
                        rethrow: false,
                    });
                }
            });
    }

    static delete(
        ctx: AppContext,
        {id, headers}: {id: Request['params']['entryId']; headers: Request['headers']},
    ) {
        const hrStart = process.hrtime();
        const formattedHeaders = formatPassedHeaders(headers, ctx);
        const axiosArgs: AxiosRequestConfig = {
            url: `${storageEndpoint}/v1/entries/${id}`,
            method: 'delete',
            headers: injectMetadata(formattedHeaders, ctx),
            timeout: TIMEOUT_10_SEC,
        };

        return axios
            .request(axiosArgs)
            .then((response) => {
                ctx.log('UNITED_STORAGE_OBJECT_DELETED', {duration: getDuration(hrStart)});

                return formatPassedProperties(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    error.code = ENTRY_NOT_FOUND;
                    error.status = 404;
                    throw error;
                } else if (error.response && error.response.status === 403) {
                    error.code = ErrorCode.EntryForbidden;
                    error.status = 403;
                    throw error;
                } else {
                    handleError({
                        code: 'UNITED_STORAGE_OBJECT_UPDATE_ERROR',
                        meta: {extra: {id}},
                        error,
                    });
                }
            });
    }
}
