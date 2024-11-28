import querystring from 'querystring';
import url from 'url';

import type {Request, Response} from '@gravity-ui/expresskit';
import get from 'lodash/get';

import type {ChartsEngine} from '..';
import {Feature, isEnabledServerFeature} from '../../../../shared';
import {DeveloperModeCheckStatus} from '../../../../shared/types';
import {registry} from '../../../registry';
import type {ResolvedConfig} from '../components/storage/types';
import {getDuration} from '../components/utils';

import {resolveChartConfig} from './utils';

type RunControllerExtraSettings = {
    storageApiPath?: string;
    extraAllowedHeaders?: string[];
};

export const runController = (
    chartsEngine: ChartsEngine,
    extraSettings?: RunControllerExtraSettings,
) => {
    return async function chartsRunController(req: Request, res: Response) {
        const {ctx} = req;
        const app = registry.getApp();

        // We need it because of timeout error after 120 seconds
        // https://forum.nginx.org/read.php?2,214230,214239#msg-214239
        req.socket.setTimeout(0);

        const hrStart = process.hrtime();

        const {id, workbookId, expectedType = null, config: chartConfig} = req.body;

        let {key, params} = req.body;

        if (!id && !key) {
            key = req.body.path || (params && params.name);
        }

        if (!id && !key && !chartConfig) {
            ctx.log('CHARTS_ENGINE_NO_KEY_NO_ID_NO_CONFIG');
            res.status(400).send({
                error: 'You must provide at least one of: id, key, config (if supported)',
            });
            return;
        }

        let config: ResolvedConfig | {error: unknown};
        if (chartConfig) {
            config = chartConfig;
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

            config = await resolveChartConfig({
                subrequestHeaders: res.locals.subrequestHeaders,
                request: req,
                params,
                id,
                key,
                workbookId,
                extraSettings,
            });
        }

        if ('error' in config) {
            const status = get(config, 'error.details.code', 500);
            res.status(status).send(config);
            return;
        }

        try {
            const configResolving = getDuration(hrStart);
            const configType = config && config.meta && config.meta.stype;

            ctx.log('CHARTS_ENGINE_CONFIG_TYPE', {configType});

            if (expectedType && expectedType !== configType) {
                ctx.log('CHARTS_ENGINE_CONFIG_TYPE_MISMATCH');
                res.status(400).send({
                    error: `Config type "${configType}" does not match expected type "${expectedType}"`,
                });
                return;
            }

            const runnerFound = chartsEngine.runners.find((runner) => {
                return runner.trigger.has(configType);
            });

            if (!runnerFound) {
                ctx.log('CHARTS_ENGINE_UNKNOWN_CONFIG_TYPE', {configType});
                res.status(400).send({
                    error: `Unknown config type ${configType}`,
                });
                return;
            }

            // TODO: remove this condition and corresponded code block after ChartEditor unit migrating
            if (
                !isEnabledServerFeature(ctx, 'EnableChartEditor') &&
                runnerFound.name === 'editor'
            ) {
                ctx.log('CHARTS_ENGINE_EDITOR_DISABLED');
                res.status(400).send({
                    error: 'ChartEditor is disabled',
                });
                return;
            }

            if (req.body.config) {
                if (!chartsEngine.config.allowBodyConfig && !runnerFound.safeConfig) {
                    ctx.log('UNSAFE_CONFIG_OVERRIDE');
                    res.status(400).send({
                        error: `It is forbidden to pass config in body for "${configType}"`,
                    });
                    return;
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
                        res.status(403).send({
                            error: {
                                code: 403,
                                details: {
                                    message: 'Access to ChartEditor developer mode was denied',
                                },
                            },
                        });
                        return;
                    }
                }
            }

            if (req.body.config) {
                res.locals.editMode = true;
            }

            req.body.config = config;

            req.body.key = req.body.key || config.key;

            runnerFound.handler(ctx, {
                chartsEngine,
                req,
                res,
                config,
                configResolving,
                workbookId,
            });
        } catch (error) {
            ctx.logError('CHARTS_ENGINE_RUNNER_ERROR', error);
            res.status(500).send({
                error: 'Internal error',
            });
        }
    };
};
