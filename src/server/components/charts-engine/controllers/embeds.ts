/* eslint-disable complexity */
import type {Request, Response} from '@gravity-ui/expresskit';
import type {AxiosError} from 'axios';
import jwt from 'jsonwebtoken';
import {isObject} from 'lodash';

import type {ChartsEngine} from '..';
import type {
    DashTab,
    DashTabItemControlData,
    DashTabItemControlDataset,
    DashTabItemControlManual,
} from '../../../../shared';
import {
    ControlType,
    DL_EMBED_TOKEN_HEADER,
    DashTabItemControlSourceType,
    DashTabItemType,
    EntryScope,
    ErrorCode,
    isEnabledServerFeature,
} from '../../../../shared';
import {resolveEmbedConfig} from '../components/storage';
import type {EmbedResolveConfigProps, ResolveConfigError} from '../components/storage/base';
import type {EmbeddingInfo, ReducedResolvedConfig} from '../components/storage/types';
import {getDuration, isDashEntry} from '../components/utils';

const isResponseError = (error: unknown): error is AxiosError<{code: string}> => {
    return Boolean(isObject(error) && 'response' in error && error.response);
};

const isControlDisabled = (
    controlData: DashTabItemControlData,
    embeddingInfo: EmbeddingInfo,
    controlTab: DashTab,
) => {
    if (
        controlData.sourceType !== DashTabItemControlSourceType.Dataset &&
        controlData.sourceType !== DashTabItemControlSourceType.Manual
    ) {
        return false;
    }
    const controlSource = controlData.source as
        | DashTabItemControlDataset['source']
        | DashTabItemControlManual['source'];

    const controlParam =
        'datasetFieldId' in controlSource ? controlSource.datasetFieldId : controlSource.fieldName;

    const tabAliases = controlTab.aliases[controlData.namespace];

    const aliasesParamsList = tabAliases
        ? tabAliases.find((alias) => alias.includes(controlParam))
        : null;

    if (embeddingInfo.embed.publicParamsMode) {
        // dash doesn't support publicParamsMode
        return false;
    } else {
        return aliasesParamsList
            ? aliasesParamsList.some((alias) => embeddingInfo.embed.privateParams.includes(alias))
            : embeddingInfo.embed.privateParams.includes(controlParam);
    }
};

export const embedsController = (chartsEngine: ChartsEngine) => {
    return function chartsRunController(req: Request, res: Response) {
        const {ctx} = req;

        // We need it because of timeout error after 120 seconds
        // https://forum.nginx.org/read.php?2,214230,214239#msg-214239
        req.socket.setTimeout(0);

        const hrStart = process.hrtime();

        const {id, controlData} = req.body;

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

            return;
        }

        const payload = jwt.decode(embedToken);

        if (!payload || typeof payload === 'string' || !('embedId' in payload)) {
            ctx.log('CHARTS_ENGINE_WRONG_TOKEN');
            res.status(400).send({
                code: ErrorCode.InvalidToken,
                extra: {message: 'Wrong token format', hideRetry: true, hideDebugInfo: true},
            });

            return;
        }

        const embedId = payload.embedId;

        res.locals.subrequestHeaders = {
            ...res.locals.subrequestHeaders,
            [DL_EMBED_TOKEN_HEADER]: embedToken,
        };

        const configResolveArgs: EmbedResolveConfigProps = {
            id,
            embedToken,
            // Key is legacy but we using it deeply like cache key, so this is just for compatibility purposes
            key: embedId,
            embedId,
            headers: {
                ...res.locals.subrequestHeaders,
                ...ctx.getMetadata(),
            },
            requestId: req.id,
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
                if (
                    isResponseError(err) &&
                    (err.response?.data.code === ErrorCode.IncorrectEntry ||
                        err.response?.data.code === ErrorCode.IncorrectDepsIds)
                ) {
                    res.status(409).send({
                        code: ErrorCode.OutdatedDependencies,
                        extra: {
                            message: 'Dependecies of embed are outdated',
                            hideRetry: true,
                            hideDebugInfo: true,
                        },
                    });

                    return;
                }
                const error: ResolveConfigError =
                    isObject(err) && 'message' in err ? (err as Error) : new Error(err as string);
                const result: {
                    error: {
                        code: string;
                        details: {
                            code: number | null;
                        };
                        extra?: {hideRetry: boolean; hideDebugInfo: boolean};
                    };
                } = {
                    error: {
                        code: 'ERR.CHARTS.CONFIG_LOADING_ERROR',
                        details: {
                            code: (error.response && error.response.status) || error.status || null,
                        },
                        extra: {hideRetry: false, hideDebugInfo: true},
                    },
                };

                ctx.logError(`CHARTS_ENGINE_CONFIG_LOADING_ERROR "token"`, error);
                const status = (error.response && error.response.status) || error.status || 500;
                res.status(status).send(result);
            })
            .then(async (embeddingInfo) => {
                if (!embeddingInfo || !('token' in embeddingInfo)) {
                    return null;
                }

                const params: Record<string, unknown> = req.body.params || {};
                const filteredParams: Record<string, unknown> = {};

                if (embeddingInfo.embed.publicParamsMode) {
                    Object.keys(params).forEach((key) => {
                        if (embeddingInfo.embed.unsignedParams.includes(key)) {
                            filteredParams[key] = params[key];
                        }
                    });
                } else {
                    Object.keys(params).forEach((key) => {
                        if (!embeddingInfo.embed.privateParams.includes(key)) {
                            filteredParams[key] = params[key];
                        }
                    });
                }

                req.body.params = {
                    ...embeddingInfo.token.params,
                    ...filteredParams,
                };

                let entry;

                if (controlData && isDashEntry(embeddingInfo.entry)) {
                    // support group and old single selectors
                    const controlWidgetId = controlData.groupId || controlData.id;
                    const controlTab = embeddingInfo.entry?.data.tabs.find(
                        ({id}) => id === controlData.tabId,
                    );

                    const controlWidgetConfig = controlTab?.items.find(
                        ({id}) => id === controlWidgetId,
                    );

                    if (
                        !controlTab ||
                        !controlWidgetConfig ||
                        (controlWidgetConfig.type !== DashTabItemType.Control &&
                            controlWidgetConfig.type !== DashTabItemType.GroupControl)
                    ) {
                        return res.status(404).send({
                            error: 'Сonfig was not found',
                        });
                    }

                    const sharedData: (DashTabItemControlData & {disabled?: boolean}) | undefined =
                        controlWidgetConfig.type === DashTabItemType.GroupControl
                            ? controlWidgetConfig.data.group.find(({id}) => id === controlData.id)
                            : controlWidgetConfig.data;

                    if (!sharedData) {
                        return res.status(404).send({
                            error: 'Сonfig was not found',
                        });
                    }

                    sharedData.disabled = isControlDisabled(sharedData, embeddingInfo, controlTab);

                    entry = {
                        data: {shared: sharedData},
                        meta: {stype: ControlType.Dash},
                    } as ReducedResolvedConfig;
                } else if (embeddingInfo.entry.scope === EntryScope.Widget) {
                    entry = embeddingInfo.entry;
                } else {
                    return res.status(400).send({
                        code: ErrorCode.InvalidToken,
                        extra: {
                            message: 'Invalid token',
                            hideRetry: true,
                            hideDebugInfo: true,
                        },
                    });
                }

                const configResolving = getDuration(hrStart);
                const configType = entry && entry.meta && entry.meta.stype;

                ctx.log('CHARTS_ENGINE_CONFIG_TYPE', {configType});

                const runnerFound = chartsEngine.runners.find((runner) => {
                    return runner.trigger.has(configType);
                });

                if (!runnerFound) {
                    ctx.log('CHARTS_ENGINE_UNKNOWN_CONFIG_TYPE', {configType});
                    return res.status(400).send({
                        error: `Unknown config type ${configType}`,
                    });
                }

                if (
                    !isEnabledServerFeature(ctx, 'EnableChartEditor') &&
                    runnerFound.name === 'editor'
                ) {
                    ctx.log('CHARTS_ENGINE_EDITOR_DISABLED');
                    return res.status(400).send({
                        error: 'ChartEditor is disabled',
                    });
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
                    config: entry,
                    configResolving,
                    forbiddenFields: ['_confStorageConfig', 'timings', 'key'],
                });
            })
            .catch((error) => {
                ctx.logError('CHARTS_ENGINE_RUNNER_ERROR', error);
                res.status(500).send({
                    error: 'Internal error',
                });
            });
    };
};
