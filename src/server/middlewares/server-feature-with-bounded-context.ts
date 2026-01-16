import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {getEnabledServerFeatureWithBoundedContext} from '../../shared';

export async function serverFeatureWithBoundedContext(
    req: Request,
    _: Response,
    next: NextFunction,
) {
    req.originalContext.set(
        'isEnabledServerFeature',
        getEnabledServerFeatureWithBoundedContext(req.originalContext),
    );

    next();
}
