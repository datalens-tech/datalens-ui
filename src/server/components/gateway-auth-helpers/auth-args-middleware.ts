import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';
import type {AppConfig} from '@gravity-ui/nodekit';
import {AppError} from '@gravity-ui/nodekit';
import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';

export type AuthArgsMiddlewareSettings = {
    usDynamicMasterTokenPrivateKey?: string;
};

const SERVICE_ID = 'ui';
const CACHE_KEY = 'usDynamicMasterToken';
const CACHE_TTL_SECONDS = 300; // 5 minutes
const JWT_EXPIRATION_SECONDS = 3600; // 1 hour

const ERROR_CODE = 'AUTH_ARGS_ERROR';

export function createAuthArgsMiddleware(config: AppConfig) {
    const {usDynamicMasterTokenPrivateKey: privateKey} = config;

    if (!privateKey) {
        throw new AppError('Private key not set', {
            code: ERROR_CODE,
        });
    }

    const cache = new NodeCache();

    return async function authArgsMiddleware(
        req: Request,
        _res: Response,
        next: NextFunction,
    ): Promise<void> {
        try {
            let token: string | undefined = cache.get(CACHE_KEY);

            if (!token) {
                const now = Math.floor(Date.now() / 1000);
                const payload = {
                    serviceId: SERVICE_ID,
                    iat: now,
                    exp: now + JWT_EXPIRATION_SECONDS,
                };

                token = jwt.sign(payload, privateKey, {
                    algorithm: 'RS256',
                });

                cache.set(CACHE_KEY, token, CACHE_TTL_SECONDS);
            }

            req.originalContext.set('usDynamicMasterToken', token);

            return next();
        } catch (error) {
            req.ctx.logError('AUTH_ARGS_ERROR', error);
            return next(
                AppError.wrap(error as unknown as Error, {
                    code: ERROR_CODE,
                }),
            );
        }
    };
}
