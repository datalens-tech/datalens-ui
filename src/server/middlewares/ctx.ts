import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';
import type {AppContextParams} from '@gravity-ui/nodekit';

import {renderHTML} from '../../shared/modules/markdown/markdown';
import {checkRequestForDeveloperModeAccess} from '../components/chart-editor-developer-mode-access-check';
import resolveEntryByLink from '../components/resolve-entry-by-link';
import {registry} from '../registry';

const markdown = (args: {text: string; lang: string}) => {
    return renderHTML({...args, plugins: registry.getYfmPlugins()});
};

export default function getCtxMiddleware() {
    return async function (req: Request, _res: Response, next: NextFunction) {
        req.originalContext.set('gateway', {
            reqBody: req.body,
            requestId: req.id,
            markdown,
            resolveEntryByLink,
            checkRequestForDeveloperModeAccess,
        } as unknown as AppContextParams['gateway']);

        next();
    };
}
