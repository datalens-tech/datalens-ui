import type {Request, Response} from '@gravity-ui/expresskit';

import {ENTRY_TYPES, TENANT_ID_HEADER, isEntryId} from '../../shared';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import Utils from '../utils';
import type {GatewayApiErrorResponse} from '../utils/gateway';

function navigateDefault(reqPath: string, res: Response) {
    return res.redirect(302, reqPath.replace('navigate', 'navigation'));
}

// eslint-disable-next-line complexity
export default async (req: Request, res: Response) => {
    const {url: reqUrl} = req;

    req.ctx.log('Navigate init', {reqUrl});

    try {
        req.ctx.log('Navigate redirect', {reqUrl});

        const possibleEntryId = req.params.entryId;

        if (!isEntryId(possibleEntryId)) {
            req.ctx.log('Invalid entry id, navigate default', {reqUrl});

            return navigateDefault(reqUrl, res);
        }

        const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();

        const {responseData: entryMeta} = await gatewayApi.us._getEntryMeta({
            ctx: req.ctx,
            headers: {
                ...req.headers,
                [TENANT_ID_HEADER]: res.locals.currentTenantId,
                ...(req.ctx.config.isZitadelEnabled ? {...Utils.pickZitadelHeaders(req)} : {}),
            },
            requestId: req.id,
            authArgs: {iamToken: res.locals.iamToken},
            args: {entryId: possibleEntryId},
        });

        if (entryMeta && entryMeta.scope === 'widget') {
            const {type} = entryMeta;
            if (type.includes('ql')) {
                const qlUrl = reqUrl.replace('navigate', 'ql');

                req.ctx.log('Navigate to ql', {qlUrl});

                return res.redirect(302, qlUrl);
            } else if (type.includes('wizard')) {
                const wizardUrl = reqUrl.replace('navigate', 'wizard');

                req.ctx.log('Navigate to wizard', {wizardUrl});

                return res.redirect(302, wizardUrl);
            } else if (ENTRY_TYPES.editor.includes(type)) {
                const editorUrl = reqUrl.replace('navigate', 'editor');

                req.ctx.log('Navigate to editor', {editorUrl});

                return res.redirect(302, editorUrl);
            } else {
                req.ctx.log('Unknown widget type, navigate default', {reqUrl});

                return navigateDefault(reqUrl, res);
            }
        } else {
            req.ctx.log('Entry is not widget, navigate default', {reqUrl});

            return navigateDefault(reqUrl, res);
        }
    } catch (error) {
        req.ctx.logError(
            'Error occured in navigate',
            ((error as GatewayApiErrorResponse<Error>).error || error) as Error,
        );

        return navigateDefault(reqUrl, res);
    }
};
