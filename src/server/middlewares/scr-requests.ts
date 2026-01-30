import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import {SCR_USER_AGENT_HEADER_VALUE} from '../../shared';

export function scrRequests() {
    return function scrRequestsMiddleware(req: Request, res: Response, next: NextFunction) {
        if (req.headers['user-agent']?.includes(SCR_USER_AGENT_HEADER_VALUE)) {
            res.locals.isRobot = true;
        }

        next();
    };
}
