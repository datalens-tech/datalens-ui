import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {MiddlewareStage} from '../../../components/charts-engine/types';

const {CHARTS_LOGIN_BLACKLIST} = process.env;

const blacklist = CHARTS_LOGIN_BLACKLIST ? new Set(CHARTS_LOGIN_BLACKLIST.split(',')) : null;

export const plugin = {
    middlewares: [
        {
            stage: MiddlewareStage.AfterAuth,
            fn: (req: Request, res: Response, next: NextFunction) => {
                const {login} = req.blackbox || {};

                if (login && blacklist && blacklist.has(login)) {
                    res.status(429).send({
                        message: 'Your login is blacklisted',
                    });
                    return;
                }

                next();
            },
        },
    ],
};
