import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';
import type {ApiActionConfig} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';
import merge from 'lodash/merge';

import type {ConnectorIconData, ListConnectorIconsResponse} from '../../shared/schema/types';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';

type ActionArgs = ApiActionConfig<AppContext, undefined, ListConnectorIconsResponse>;
type GetAdditionalArgs = (req: Request, res: Response) => Partial<ActionArgs>;

export function getConnectorIconsMiddleware({
    getAdditionalArgs,
}: {getAdditionalArgs?: GetAdditionalArgs} = {}) {
    return async function connectorIconsMiddleware(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        let icons: ConnectorIconData[] = [];

        try {
            req.ctx.log('REQUEST_CONNECTOR_ITEMS');
            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
            const actionArgs: ActionArgs = {
                args: undefined,
                ctx: req.ctx,
                headers: {...req.headers},
                requestId: req.id,
            };
            const additionalArgs = getAdditionalArgs?.(req, res);

            if (additionalArgs) {
                merge(actionArgs, additionalArgs);
            }

            ({
                responseData: {icons},
            } = await gatewayApi.bi.listConnectorIcons(actionArgs));
        } catch (e) {
            req.ctx.logError('REQUEST_CONNECTOR_ITEMS_FAILED', e);
        }

        // eslint-disable-next-line no-param-reassign
        res.locals.connectorIcons = icons;

        next();
    };
}
