import type {NextFunction, Request, Response} from '@gravity-ui/expresskit';

import type {ConnectorIconData} from '../../shared/schema/types';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';

export function getConnectorIconsMiddleware() {
    return async function (req: Request, res: Response, next: NextFunction) {
        let icons: ConnectorIconData[] = [];

        try {
            req.ctx.log('REQUEST_CONNECTOR_ITEMS');
            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
            ({
                responseData: {icons},
            } = await gatewayApi.bi.listConnectorIcons({
                args: undefined,
                ctx: req.ctx,
                headers: {
                    ...req.headers,
                },
                requestId: req.id,
            }));
        } catch (e) {
            req.ctx.logError('REQUEST_CONNECTOR_ITEMS_FAILED', e);
        }

        // eslint-disable-next-line no-param-reassign
        res.locals.connectorIcons = icons;

        next();
    };
}
