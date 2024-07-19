import type {Request, Response} from '@gravity-ui/expresskit';
import jwt from 'jsonwebtoken';

import type {ChartsEngine} from '..';
import {DL_EMBED_TOKEN_HEADER} from '../../../../shared';
import {resolveConfig} from '../components/storage';
import type {ResolveConfigProps} from '../components/storage/base';
import {getDuration} from '../components/utils';

export const embedsController = (chartsEngine: ChartsEngine) => {
    return function chartsRunController(req: Request, res: Response) {
        const {ctx} = req;

        // We need it because of timeout error after 120 seconds
        // https://forum.nginx.org/read.php?2,214230,214239#msg-214239
        req.socket.setTimeout(0);

        const hrStart = process.hrtime();

        const {expectedType = null} = req.body;

        const embedToken = Array.isArray(req.headers[DL_EMBED_TOKEN_HEADER])
            ? ''
            : req.headers[DL_EMBED_TOKEN_HEADER];

        if (!embedToken) {
            ctx.log('CHARTS_ENGINE_NO_TOKEN');
            res.status(400).send({
                error: 'You must provide embedToken',
            });

            return;
        }

        const payload = jwt.decode(embedToken);

        if (!payload || typeof payload === 'string' || !('embedId' in payload)) {
            ctx.log('CHARTS_ENGINE_WRONG_TOKEN');
            res.status(400).send({
                code: 'ERR.CHARTS.WRONG_EMBED_TOKEN',
                extra: {message: 'Wrong token format', hideRetry: true, hideDebugInfo: true},
            });

            return;
        }

        const embedId = payload.embedId;

        res.locals.subrequestHeaders = {
            ...res.locals.subrequestHeaders,
            [DL_EMBED_TOKEN_HEADER]: embedToken,
        };

        const configResolveArgs: ResolveConfigProps = {
            embedToken,
            // Key is legacy but we using it deeply like cache key, so this is just for compatibility purposes
            key: embedId,
            headers: {
                ...res.locals.subrequestHeaders,
                ...ctx.getMetadata(),
            },
            requestId: req.id,
        };

        const configPromise = ctx.call('configLoading', (cx) =>
            resolveConfig(cx, configResolveArgs),
        );

        ctx.log('CHARTS_ENGINE_LOADING_CONFIG', {embedId});

        Promise.resolve(configPromise)
            .catch((error) => {
                const result: {
                    error: {
                        code: string;
                        details: {
                            code: string;
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
                res.status(error.status || 500).send(result);
            })
            .then(async (embeddingInfo) => {
                if (!embeddingInfo || !('token' in embeddingInfo)) {
                    return null;
                }

                const params: Record<string, unknown> = req.body.params || {};
                const filteredParams: Record<string, unknown> = {};

                Object.keys(params).forEach((key) => {
                    if (embeddingInfo.embed.unsignedParams.includes(key)) {
                        filteredParams[key] = params[key];
                    }
                });

                req.body.params = {
                    ...embeddingInfo.token.params,
                    ...filteredParams,
                };

                const config = embeddingInfo.entry;

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

                req.body.config = config;
                req.body.key = config.key;

                return runnerFound.handler(ctx, {
                    chartsEngine,
                    req,
                    res,
                    config,
                    configResolving,
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
