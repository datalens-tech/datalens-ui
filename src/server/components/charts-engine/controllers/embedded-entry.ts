import type {Request, Response} from '@gravity-ui/expresskit';
import jwt from 'jsonwebtoken';

import {DL_EMBED_TOKEN_HEADER} from '../../../../shared';
import {resolveConfig} from '../components/storage';
import type {ResolveConfigProps} from '../components/storage/base';

export const embeddedEntryController = (req: Request, res: Response) => {
    const {ctx} = req;

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
            extra: {message: 'Wrong token format', hideRetry: true},
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

    const configPromise = ctx.call('configLoading', (cx) => resolveConfig(cx, configResolveArgs));

    ctx.log('CHARTS_ENGINE_LOADING_CONFIG', {embedId});

    Promise.resolve(configPromise)
        .catch((error) => {
            const result: {
                error: {
                    code: string;
                    details: {
                        code: string;
                    };
                    extra?: {hideRetry: boolean};
                };
            } = {
                error: {
                    code: 'ERR.ENTRY.CONFIG_LOADING_ERROR',
                    details: {
                        code: (error.response && error.response.status) || error.status || null,
                    },
                    extra: {hideRetry: false},
                },
            };

            ctx.logError(`CHARTS_ENGINE_CONFIG_LOADING_ERROR "token"`, error);
            res.status(error.status || 500).send(result);
        })
        .then(async (response) => {
            if (response && 'entry' in response) {
                const {entry, embed} = response;

                const params: URLSearchParams = new URLSearchParams(req.body.params) || {};
                const filteredParams: Record<string, unknown> = {};

                for (const [key] of params) {
                    if (embed.unsignedParams.includes(key)) {
                        filteredParams[key] = params.get(key);
                    }
                }

                // Add only necessary fields without personal info like createdBy
                res.status(200).send({
                    entryId: entry.entryId,
                    scope: entry.scope,
                    data: entry.data,
                    params: filteredParams,
                });
            }
        })
        .catch((error) => {
            ctx.logError('CHARTS_ENGINE_RUNNER_ERROR', error);
            res.status(500).send({
                error: 'Internal error',
            });
        });
};
