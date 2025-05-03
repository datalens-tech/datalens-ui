import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

export function patchLogger(req: Request, _res: Response, next: NextFunction) {
    const logErrorCore = req.ctx.logError;
    // It is suspicious that monkey patching is only for utils, because there is still ctx
    req.ctx.logError = (message, error: any, extra) => {
        if (error && error.response) {
            if (error.response.request) {
                delete error.response.request.headers;
            }

            if (error.response.req) {
                delete error.response.req.headers;
            }
        }

        logErrorCore(message, error, extra);
    };

    next();
}
