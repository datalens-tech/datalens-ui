import type {Request, Response} from '@gravity-ui/expresskit';
import jwt from 'jsonwebtoken';

import {DL_EMBED_TOKEN_HEADER} from '../../../../shared';
import {resolveConfig} from '../components/storage';
import type {ResolveConfigProps} from '../components/storage/base';
import type {ResolvedConfig} from '../components/storage/types';

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
        id: req.params.entryId,
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
                    debug?: {
                        message: string;
                    };
                    extra?: {hideRetry: boolean};
                };
            } = {
                error: {
                    code: 'ERR.CHARTS.CONFIG_LOADING_ERROR',
                    details: {
                        code: (error.response && error.response.status) || error.status || null,
                    },
                    debug: {
                        message: error.message,
                    },
                    extra: {hideRetry: false},
                },
            };

            delete result.error.debug;

            ctx.logError(`CHARTS_ENGINE_CONFIG_LOADING_ERROR "token"`, error);
        })
        .then(async (response) => {
            let entry: ResolvedConfig | null = null;

            if (response && 'token' in response) {
                entry = response.entry;
            } else if (response && 'entryId' in response) {
                entry = response;
            }

            if (entry) {
                // Add only necessary fields without personal info like createdBy
                return res.status(200).send({
                    entryId: entry.entryId,
                    scope: entry.scope,
                    type: entry.type,
                    data: entry.data,
                    meta: entry.meta,
                    links: entry.links,
                });
            }

            ctx.log('CHARTS_ENGINE_RUNNER_ERROR');
            return res.status(500).send({
                error: 'Internal error',
            });
        });
};
