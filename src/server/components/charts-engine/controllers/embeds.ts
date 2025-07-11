/* eslint-disable complexity */
import type {Request, Response} from '@gravity-ui/expresskit';
import type {AppContext} from '@gravity-ui/nodekit';
import type {AxiosError} from 'axios';
import jwt from 'jsonwebtoken';
import get from 'lodash/get';
import isObject from 'lodash/isObject';

import type {ChartsEngine} from '..';
import type {DashTab, DashTabItemControlData} from '../../../../shared';
import {
    ControlType,
    DL_EMBED_TOKEN_HEADER,
    DashTabItemType,
    EntryScope,
    ErrorCode,
    Feature,
} from '../../../../shared';
import {resolveEmbedConfig} from '../components/storage';
import type {EmbedResolveConfigProps} from '../components/storage/base';
import type {EmbeddingInfo, ReducedResolvedConfig} from '../components/storage/types';
import {getDuration, isDashEntry} from '../components/utils';
import {findTabByWidgetId, getTypedError, processTabAliases} from '../helpers/embeds';

const isResponseError = (error: unknown): error is AxiosError<{code: string}> => {
    return Boolean(isObject(error) && 'response' in error && error.response);
};

function validateEmbedToken(
    req: Request,
    ctx: AppContext,
    res: Response,
): {embedToken: string; embedId: string} | null {
    const embedToken = Array.isArray(req.headers[DL_EMBED_TOKEN_HEADER])
        ? ''
        : req.headers[DL_EMBED_TOKEN_HEADER];

    if (!embedToken) {
        ctx.log('CHARTS_ENGINE_NO_TOKEN');
        res.status(400).send({
            code: ErrorCode.TokenNotFound,
            extra: {
                message: 'You must provide embedToken',
                hideRetry: true,
                hideDebugInfo: true,
            },
        });
        return null;
    }

    const payload = jwt.decode(embedToken);

    if (!payload || typeof payload === 'string' || !('embedId' in payload)) {
        ctx.log('CHARTS_ENGINE_WRONG_TOKEN');
        res.status(400).send({
            code: ErrorCode.InvalidToken,
            extra: {message: 'Wrong token format', hideRetry: true, hideDebugInfo: true},
        });
        return null;
    }

    const embedId = payload.embedId;

    // Update subrequest headers
    res.locals.subrequestHeaders = {
        ...res.locals.subrequestHeaders,
        [DL_EMBED_TOKEN_HEADER]: embedToken,
    };

    return {embedToken, embedId};
}

function handleError(
    error: unknown,
    ctx: AppContext,
    res: Response,
    defaultCode = 'ERR.CHARTS.CONFIG_LOADING_ERROR',
    errorLog = 'CHARTS_ENGINE_RUNNER_ERROR',
): void {
    // Handle specific error cases for outdated dependencies
    if (
        isResponseError(error) &&
        (error.response?.data.code === ErrorCode.IncorrectEntry ||
            error.response?.data.code === ErrorCode.IncorrectDepsIds)
    ) {
        res.status(409).send({
            code: ErrorCode.OutdatedDependencies,
            extra: {
                message: 'Dependencies of embed are outdated',
                hideRetry: true,
                hideDebugInfo: true,
            },
        });
        return;
    }

    const typedError = getTypedError(error);

    const status = (typedError.response && typedError.response.status) || typedError.status || 500;

    const errorCode =
        (typedError.response && typedError.response.status) || typedError.status || defaultCode;

    ctx.logError(errorLog, typedError);

    res.status(status).send({
        code: errorCode,
        error: {
            code: errorCode,
            details: {
                code: status,
            },
            extra: {
                hideRetry: false,
                hideDebugInfo: true,
            },
        },
    });
}

function processControlWidget(
    controlData: {
        id: string;
        widgetId?: string;
        tabId: string;
    },
    embeddingInfo: EmbeddingInfo,
    res: Response,
    prefoundTab?: DashTab | null,
): ReducedResolvedConfig | null {
    if (!isDashEntry(embeddingInfo.entry)) {
        return null;
    }

    // Support group and old single selectors
    const controlWidgetId = controlData.widgetId || controlData.id;

    const controlWidgetConfig = prefoundTab?.items.find(
        ({id}: {id: string}) => id === controlWidgetId,
    );

    // Early return if control widget config is not found or has invalid type
    if (
        !prefoundTab ||
        !controlWidgetConfig ||
        (controlWidgetConfig.type !== DashTabItemType.Control &&
            controlWidgetConfig.type !== DashTabItemType.GroupControl)
    ) {
        res.status(404).send({
            error: 'Сonfig was not found',
        });
        return null;
    }

    const sharedData: DashTabItemControlData | undefined =
        controlWidgetConfig.type === DashTabItemType.GroupControl
            ? controlWidgetConfig.data.group.find(({id}: {id: string}) => id === controlData.id)
            : controlWidgetConfig.data;

    if (!sharedData) {
        res.status(404).send({
            error: 'Сonfig was not found',
        });
        return null;
    }

    return {
        data: {shared: sharedData},
        meta: {stype: ControlType.Dash},
    } as ReducedResolvedConfig;
}

function processEntry(
    controlData:
        | {
              id: string;
              widgetId?: string;
              tabId: string;
          }
        | undefined,
    embeddingInfo: EmbeddingInfo,
    res: Response,
    prefoundTab?: DashTab | null,
): ReducedResolvedConfig | null {
    if (controlData && isDashEntry(embeddingInfo.entry)) {
        return processControlWidget(controlData, embeddingInfo, res, prefoundTab);
    }

    if (embeddingInfo.entry.scope === EntryScope.Widget) {
        return embeddingInfo.entry;
    }

    // Invalid entry type
    res.status(400).send({
        code: ErrorCode.InvalidToken,
        extra: {
            message: 'Invalid token',
            hideRetry: true,
            hideDebugInfo: true,
        },
    });
    return null;
}

async function filterParams({
    params = {},
    embeddingInfo,
    ctx,
    tabsToProcess,
}: {
    params: Record<string, unknown>;
    embeddingInfo: EmbeddingInfo;
    ctx: AppContext;
    embedToken: string;
    subrequestHeaders: Record<string, string>;
    currentWidgetId?: string;
    tabsToProcess: DashTab[] | null;
}): Promise<{params: Record<string, unknown>; privateParams?: Set<string>}> {
    if (!params || Object.keys(params).length === 0) {
        return {params: {...embeddingInfo.token.params}};
    }

    const isSecureParamsV2Enabled = ctx.get('isEnabledServerFeature')(Feature.EnableSecureParamsV2);

    const filteredParams: Record<string, unknown> = {};

    let forbiddenParamsSet: Set<string> | undefined;

    if (embeddingInfo.embed.publicParamsMode && embeddingInfo.embed.unsignedParams.length > 0) {
        const unsignedParamsSet = new Set(embeddingInfo.embed.unsignedParams);

        Object.keys(params).forEach((key) => {
            if (unsignedParamsSet.has(key)) {
                filteredParams[key] = params[key];
            }
        });
    } else if (embeddingInfo.embed.privateParams?.length === 0) {
        Object.assign(filteredParams, params);
    } else {
        const fillingForbiddenParamsSet = new Set(embeddingInfo.embed.privateParams);

        if (tabsToProcess && isSecureParamsV2Enabled) {
            processTabAliases(tabsToProcess, fillingForbiddenParamsSet);
        }

        for (const [key, value] of Object.entries(params)) {
            if (!fillingForbiddenParamsSet.has(key)) {
                filteredParams[key] = value;
            }
        }

        forbiddenParamsSet = fillingForbiddenParamsSet;
    }

    let finalParams;

    if (isSecureParamsV2Enabled) {
        finalParams = {
            // params from token are considered as constant
            // they have the most priority over incoming params
            ...filteredParams,
            ...embeddingInfo.token.params,
        };
    } else {
        finalParams = {
            ...embeddingInfo.token.params,
            ...filteredParams,
        };
    }

    return {
        params: finalParams,
        privateParams: forbiddenParamsSet,
    };
}

function findAndExecuteRunner(
    entry: ReducedResolvedConfig,
    chartsEngine: ChartsEngine,
    ctx: AppContext,
    req: Request,
    res: Response,
    configResolving: number,
    embeddingInfo: EmbeddingInfo,
    privateParams?: Set<string>,
) {
    const configType = entry?.meta?.stype;

    ctx.log('CHARTS_ENGINE_CONFIG_TYPE', {configType});

    const runnerFound = chartsEngine.runners.find((runner) => {
        return runner.trigger.has(configType);
    });

    if (!runnerFound) {
        ctx.log('CHARTS_ENGINE_UNKNOWN_CONFIG_TYPE', {configType});
        res.status(400).send({
            error: `Unknown config type ${configType}`,
        });
        return Promise.resolve(null);
    }

    const isEnabledServerFeature = ctx.get('isEnabledServerFeature');
    if (!isEnabledServerFeature('EnableChartEditor') && runnerFound.name === 'editor') {
        ctx.log('CHARTS_ENGINE_EDITOR_DISABLED');
        res.status(400).send({
            error: 'Editor is disabled',
        });
        return Promise.resolve(null);
    }

    req.body.config = entry;
    req.body.key = entry.key;

    req.body.widgetConfig = {
        ...req.body.widgetConfig,
        enableExport: embeddingInfo.embed.settings?.enableExport === true,
    };

    return runnerFound.handler(ctx, {
        chartsEngine,
        req,
        res,
        config: {
            ...entry,
            data: {
                ...entry.data,
                url: get(entry.data, 'sources') || get(entry.data, 'url'),
                js: get(entry.data, 'prepare') || get(entry.data, 'js'),
                ui: get(entry.data, 'controls') || get(entry.data, 'ui'),
            },
        },
        configResolving,
        // converting it to an array, since for some runners the fields must be serializable
        secureConfig: {privateParams: privateParams ? Array.from(privateParams) : undefined},
        forbiddenFields: ['_confStorageConfig', 'timings', 'key'],
    });
}

export const embedsController = (chartsEngine: ChartsEngine) => {
    return function chartsRunController(req: Request, res: Response) {
        const {ctx} = req;

        // We need it because of timeout error after 120 seconds
        // https://forum.nginx.org/read.php?2,214230,214239#msg-214239
        req.socket.setTimeout(0);

        const hrStart = process.hrtime();

        const {id, controlData, widgetData} = req.body;

        const tokenData = validateEmbedToken(req, ctx, res);
        if (!tokenData) {
            return; // Token validation failed, response already sent
        }

        const {embedToken, embedId} = tokenData;

        const subrequestHeaders = res.locals.subrequestHeaders;

        const configResolveArgs: EmbedResolveConfigProps = {
            id,
            embedToken,
            // Key is legacy but we using it deeply like cache key, so this is just for compatibility purposes
            key: embedId,
            embedId,
            headers: {
                ...subrequestHeaders,
                ...ctx.getMetadata(),
            },
            includeServicePlan: true,
            includeTenantFeatures: true,
        };

        // 1. it's embedded chart, id is not used, chart is resolved by token
        // 2. it's widget from embedded dash, id is used, chart is resolved by
        // token and id
        // 3. it's selector from embedded dash, id is not used, dash is resolved by
        // token to get embeddedInfo and check token
        const configPromise = ctx.call('configLoading', (cx) =>
            resolveEmbedConfig(cx, configResolveArgs),
        );

        ctx.log('CHARTS_ENGINE_LOADING_CONFIG', {embedId});

        Promise.resolve(configPromise)
            .catch((err: unknown) => {
                handleError(
                    err,
                    ctx,
                    res,
                    'ERR.CHARTS.CONFIG_LOADING_ERROR',
                    'CHARTS_ENGINE_CONFIG_LOADING_ERROR "token"',
                );
            })
            .then(async (embeddingInfo) => {
                if (!embeddingInfo || !('token' in embeddingInfo)) {
                    return null;
                }

                // Find the target tab
                const currentWidgetId =
                    controlData?.widgetId || controlData?.id || widgetData?.widgetId;
                let dashTabs: DashTab[] | null = null;
                let prefoundTab = null;

                const isSecureParamsV2Enabled = ctx.get('isEnabledServerFeature')(
                    Feature.EnableSecureParamsV2,
                );

                if (currentWidgetId) {
                    if (controlData && isDashEntry(embeddingInfo.entry)) {
                        // Tab is available in current entry
                        prefoundTab = findTabByWidgetId(
                            embeddingInfo.entry.data.tabs,
                            currentWidgetId,
                        );
                        dashTabs = embeddingInfo.entry.data.tabs;
                    } else if (isSecureParamsV2Enabled) {
                        // Need to fetch dash config to find the tab
                        const dashConfigResolveArgs: EmbedResolveConfigProps = {
                            embedToken,
                            key: embeddingInfo.embed.embedId,
                            embedId: embeddingInfo.embed.embedId,
                            headers: {
                                ...subrequestHeaders,
                                ...ctx.getMetadata(),
                            },
                        };

                        try {
                            const embeddedDashData = await ctx.call('configLoading', (cx) =>
                                resolveEmbedConfig(cx, dashConfigResolveArgs),
                            );

                            if (embeddedDashData && isDashEntry(embeddedDashData.entry)) {
                                prefoundTab = findTabByWidgetId(
                                    embeddedDashData.entry.data.tabs,
                                    currentWidgetId,
                                    id,
                                );
                                dashTabs = embeddedDashData.entry.data.tabs;
                            }
                        } catch (error) {
                            handleError(
                                error,
                                ctx,
                                res,
                                'ERR.CHARTS.DASH_CONFIG_LOADING_ERROR',
                                'RESOLVE_CHARTS_EMBEDDED_DASH_CONFIG_ERROR',
                            );
                        }
                    }
                }

                const {params, privateParams} = await filterParams({
                    params: req.body.params,
                    embeddingInfo,
                    ctx,
                    embedToken,
                    subrequestHeaders,
                    currentWidgetId,
                    tabsToProcess: prefoundTab ? [prefoundTab] : dashTabs,
                });

                req.body.params = params;

                const entry = processEntry(controlData, embeddingInfo, res, prefoundTab);

                // If entry processing failed, the response has already been sent
                if (!entry) {
                    return null;
                }

                const configResolving = getDuration(hrStart);

                return findAndExecuteRunner(
                    entry,
                    chartsEngine,
                    ctx,
                    req,
                    res,
                    configResolving,
                    embeddingInfo,
                    privateParams,
                );
            })
            .catch((error) => {
                handleError(error, ctx, res, 'ERR.CHARTS.CHARTS_ENGINE_RUNNER_ERROR');
            });
    };
};
