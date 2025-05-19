import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';
import {type AppContextParams, REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';

import {checkRequestForDeveloperModeAccess} from '../components/chart-editor-developer-mode-access-check';
import {renderHTML} from '../components/charts-engine/components/markdown';
import resolveEntryByLink from '../components/resolve-entry-by-link';

export function getCtxMiddleware() {
    return async function ctxMiddleware(req: Request, _res: Response, next: NextFunction) {
        req.originalContext.set('gateway', {
            reqBody: req.body,
            requestId: req.ctx.get(REQUEST_ID_PARAM_NAME),

            markdown: renderHTML,
            resolveEntryByLink,

            checkRequestForDeveloperModeAccess,
        } as unknown as AppContextParams['gateway']);

        next();
    };
}
