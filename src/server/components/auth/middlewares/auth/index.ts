import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {apiAuth} from './api-auth';
import {uiAuth} from './ui-auth';

export async function appAuth(req: Request, res: Response, next: NextFunction) {
    if (req.routeInfo.ui) {
        uiAuth(req, res, next);
    } else {
        apiAuth(req, res, next);
    }
}
