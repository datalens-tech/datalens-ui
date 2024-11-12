import type {Request, Response} from '@gravity-ui/expresskit';
import jwt from 'jsonwebtoken';
import {isObject} from 'lodash';

import {DL_EMBED_TOKEN_HEADER, EntryScope, ErrorCode} from '../../../../shared';
import {resolveEmbedConfig} from '../components/storage';
import type {EmbedResolveConfigProps, ResolveConfigError} from '../components/storage/base';

export const embeddedEntryController = (req: Request, res: Response) => {
    const {ctx} = req;

    const embedToken = Array.isArray(req.headers[DL_EMBED_TOKEN_HEADER])
        ? ''
        : req.headers[DL_EMBED_TOKEN_HEADER];

    if (!embedToken) {
        ctx.log('CHARTS_ENGINE_NO_TOKEN');
        res.status(400).send({
            code: ErrorCode.InvalidTokenFormat,
            extra: {message: 'You must provide embedToken', hideRetry: true},
        });
        return;
    }

    const payload = jwt.decode(embedToken);

    if (!payload || typeof payload === 'string' || !('embedId' in payload)) {
        ctx.log('CHARTS_ENGINE_WRONG_TOKEN');
        res.status(400).send({
            code: ErrorCode.InvalidTokenFormat,
            extra: {message: 'Wrong token format', hideRetry: true},
        });
        return;
    }

    const embedId = payload.embedId;

    res.locals.subrequestHeaders = {
        ...res.locals.subrequestHeaders,
        [DL_EMBED_TOKEN_HEADER]: embedToken,
    };

    const configResolveArgs: EmbedResolveConfigProps = {
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

    const configPromise = ctx.call('configLoading', (cx) =>
        resolveEmbedConfig(cx, configResolveArgs),
    );

    ctx.log('CHARTS_ENGINE_LOADING_CONFIG', {embedId});

    Promise.resolve(configPromise)
        .catch((err: unknown) => {
            const error: ResolveConfigError =
                isObject(err) && 'message' in err ? (err as Error) : new Error(err as string);
            const result: {
                error: {
                    code: string;
                    details: {
                        code: number | null;
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
            const status = (error.response && error.response.status) || error.status || 500;
            res.status(status).send(result);
        })
        .then(async (response) => {
            if (response && 'entry' in response) {
                if (response.entry.scope === EntryScope.Dash) {
                    const {
                        entry: {entryId, scope, data},
                    } = response;

                    // Add only necessary fields without personal info like createdBy
                    res.status(200).send({
                        entryId,
                        scope,
                        data,
                    });
                } else {
                    res.status(400).send({
                        code: ErrorCode.InvalidToken,
                        extra: {
                            message: 'Invalid token',
                            hideRetry: true,
                        },
                    });
                }
            }
        })
        .catch((error) => {
            ctx.logError('CHARTS_ENGINE_RUNNER_ERROR', error);
            res.status(500).send({
                error: 'Internal error',
            });
        });
};
