import type {Request, Response} from '@gravity-ui/expresskit';

import {Utils} from '../components';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import type {GatewayApiErrorResponse} from '../utils/gateway';

export const apiContollers = {
    deleteLock: async (req: Request, res: Response) => {
        try {
            const {entryId, params} = req.body;

            const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
            const {responseData} = await gatewayApi.us.deleteLock({
                authArgs: {iamToken: res.locals.iamToken},
                headers: Utils.pickHeaders(req),
                ctx: req.ctx,
                requestId: req.id,
                args: {
                    entryId,
                    params,
                },
            });

            res.status(200).send(responseData);
        } catch (ex) {
            const {error} = ex as GatewayApiErrorResponse;
            res.status(error.status).send(error);
        }
    },
};
