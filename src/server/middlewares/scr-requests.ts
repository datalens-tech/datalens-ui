import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

const SCR_USER_AGENT = 'StatScreenshooter';

export function scrRequests() {
    return function scrRequestsMiddleware(req: Request, res: Response, next: NextFunction) {
        if (req.headers['user-agent']?.includes(SCR_USER_AGENT)) {
            res.locals.isRobot = true;
        }

        next();
    };
}
