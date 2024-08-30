import querystring from 'querystring';
import url from 'url';

import type {Request, Response} from '@gravity-ui/expresskit';
import {isObject} from 'lodash';

import type {ChartsEngine} from '..';
import {Feature, isEnabledServerFeature} from '../../../../shared';
import {DeveloperModeCheckStatus} from '../../../../shared/types';
import {registry} from '../../../registry';
import Utils from '../../../utils';
import {resolveConfig} from '../components/storage';
import type {ResolveConfigError, ResolveConfigProps} from '../components/storage/base';
import {getDuration} from '../components/utils';

type RunControllerExtraSettings = {
    storageApiPath?: string;
    extraAllowedHeaders?: string[];
};

export const runController = (
    chartsEngine: ChartsEngine,
    extraSettings?: RunControllerExtraSettings,
) => {
    return function chartsRunController(req: Request, res: Response) {
        const {ctx} = req;
        const app = registry.getApp();

        // We need it because of timeout error after 120 seconds
        // https://forum.nginx.org/read.php?2,214230,214239#msg-214239
        req.socket.setTimeout(0);

        const hrStart = process.hrtime();

        const {id, workbookId, expectedType = null, config} = req.body;

        let {key, params} = req.body;

        if (!id && !key) {
            key = req.body.path || (params && params.name);
        }

        if (!id && !key && !config) {
            ctx.log('CHARTS_ENGINE_NO_KEY_NO_ID_NO_CONFIG');
            res.status(400).send({
                error: 'You must provide at least one of: id, key, config (if supported)',
            });

            return;
        }

        let configPromise;
        if (config) {
            configPromise = config;
        } else {
            if (!params && key) {
                const parsedUrl = url.parse(key);
                if (parsedUrl.query) {
                    if (!req.body.params) {
                        req.body.params = {};
                    }

                    req.body.params = params = {
                        ...req.body.params,
                        ...querystring.parse(parsedUrl.query),
                    };
                }
            }

            let useUnreleasedConfig = req.body.unreleased === '1';
            if (params) {
                if (Array.isArray(params.unreleased)) {
                    useUnreleasedConfig = useUnreleasedConfig || params.unreleased[0] === '1';
                } else {
                    useUnreleasedConfig = useUnreleasedConfig || params.unreleased === '1';
                }
            }

            const configResolveArgs: ResolveConfigProps = {
                unreleased: useUnreleasedConfig,
                key,
                id,
                workbookId,
                headers: {
                    ...res.locals.subrequestHeaders,
                    ...ctx.getMetadata(),
                    ...(ctx.config.isZitadelEnabled ? {...Utils.pickZitadelHeaders(req)} : {}),
                },
                requestId: req.id,
                ...extraSettings,
            };

            configPromise = ctx.call('configLoading', (cx) => resolveConfig(cx, configResolveArgs));
        }

        ctx.log('CHARTS_ENGINE_LOADING_CONFIG', {key, id});

        Promise.resolve(configPromise)
            .catch((err: unknown) => {
                const error: ResolveConfigError =
                    isObject(err) && 'message' in err ? (err as Error) : new Error(err as string);
                const result: {
                    error: {
                        code: string;
                        details: {
                            code: number | null;
                            entryId: string;
                        };
                        debug?: {
                            message: unknown;
                        };
                    };
                } = {
                    error: {
                        code: 'ERR.CHARTS.CONFIG_LOADING_ERROR',
                        details: {
                            code: (error.response && error.response.status) || error.status || null,
                            entryId: id,
                        },
                        debug: {
                            message: error.message,
                        },
                    },
                };

                // TODO use ShowChartsEngineDebugInfo flag
                if (ctx.config.appInstallation !== 'internal') {
                    delete result.error.debug;
                }

                ctx.logError(`CHARTS_ENGINE_CONFIG_LOADING_ERROR "${key || id}"`, error);
                const status = (error.response && error.response.status) || error.status || 500;
                res.status(status).send(result);
            })
            .then(async (config) => {
                if (!config) {
                    return null;
                }

                const configResolving = getDuration(hrStart);
                const configType = config && config.meta && config.meta.stype;

                ctx.log('CHARTS_ENGINE_CONFIG_TYPE', {configType});

                if (expectedType && expectedType !== configType) {
                    ctx.log('CHARTS_ENGINE_CONFIG_TYPE_MISMATCH');
                    return res.status(400).send({
                        error: `Config type "${configType}" does not match expected type "${expectedType}"`,
                    });
                }

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
                    !isEnabledServerFeature(ctx, Feature.EnableChartEditor) &&
                    runnerFound.name === 'editor'
                ) {
                    ctx.log('CHARTS_ENGINE_EDITOR_DISABLED');
                    return res.status(400).send({
                        error: 'ChartEditor is disabled',
                    });
                }

                if (req.body.config) {
                    if (!chartsEngine.config.allowBodyConfig && !runnerFound.safeConfig) {
                        ctx.log('UNSAFE_CONFIG_OVERRIDE');
                        return res.status(400).send({
                            error: `It is forbidden to pass config in body for "${configType}"`,
                        });
                    }

                    if (
                        isEnabledServerFeature(app.nodekit.ctx, Feature.ShouldCheckEditorAccess) &&
                        runnerFound.name === 'editor'
                    ) {
                        const {checkRequestForDeveloperModeAccess} = req.ctx.get('gateway');
                        const checkResult = await checkRequestForDeveloperModeAccess({
                            ctx: req.ctx,
                        });

                        if (checkResult === DeveloperModeCheckStatus.Forbidden) {
                            return res.status(403).send({
                                error: {
                                    code: 403,
                                    details: {
                                        message: 'Access to ChartEditor developer mode was denied',
                                    },
                                },
                            });
                        }
                    }
                }

                if (req.body.config) {
                    res.locals.editMode = true;
                }

                req.body.config = config;

                req.body.key = req.body.key || config.key;

                return runnerFound.handler(ctx, {
                    chartsEngine,
                    req,
                    res,
                    config,
                    configResolving,
                    workbookId,
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
