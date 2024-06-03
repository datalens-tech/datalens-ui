import type {Plugin} from '@gravity-ui/app-layout';
import {createRenderFunction} from '@gravity-ui/app-layout';
import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import type {AppLayoutSettings} from '../types/app-layout';

type CreateAppLayoutMiddlewareArgs = {
    plugins: Plugin[];
    getAppLayoutSettings: (req: Request, res: Response, name?: string) => AppLayoutSettings;
};
export function createAppLayoutMiddleware(args: CreateAppLayoutMiddlewareArgs) {
    const {plugins, getAppLayoutSettings} = args;

    return function appLayoutMiddleware(req: Request, res: Response, next: NextFunction) {
        req.originalContext.set('getAppLayoutSettings', getAppLayoutSettings);
        // eslint-disable-next-line no-param-reassign
        res.renderDatalensLayout = createRenderFunction([...plugins]);
        next();
    };
}
