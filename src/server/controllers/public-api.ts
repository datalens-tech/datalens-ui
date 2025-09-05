import type {Request, Response} from '@gravity-ui/expresskit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';
import _ from 'lodash';

import type {PublicApiRpcMap} from '../components/public-api/types';
import {PUBLIC_API_RPC_ERROR_CODE} from '../constants/public-api';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import Utils from '../utils';

const handleError = (req: Request, res: Response, status: number, message: string) => {
    res.status(status).send({
        status,
        code: PUBLIC_API_RPC_ERROR_CODE,
        message,
        requestId: req.ctx.get(REQUEST_ID_PARAM_NAME) || '',
    });
};

export function createPublicApiController() {
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
    const {proxyMap} = registry.getPublicApiConfig();

    return async function publicApiController(req: Request, res: Response) {
        const boundeHandler = handleError.bind(null, req, res);

        if (!req.params.version || !req.params.action) {
            return boundeHandler(400, 'Invalid params, version or action are empty');
        }

        const version = req.params.version as keyof PublicApiRpcMap;
        if (!_.has(proxyMap, version)) {
            return boundeHandler(404, 'Version not found');
        }

        const versionMap = proxyMap[version];
        const actionName = req.params.action as keyof typeof versionMap;
        if (!_.has(proxyMap[version], req.params.action)) {
            return boundeHandler(404, 'Action not found');
        }

        try {
            const action = versionMap[actionName];
            const {ctx} = req;

            const initialHeaders = Utils.pickRpcHeaders(req);
            const headers = action.headers ? action.headers(req, initialHeaders) : initialHeaders;
            const args = action.args ? await action.args(req) : req.body;
            const requestId = ctx.get(REQUEST_ID_PARAM_NAME) || '';

            const result = await action.resolve(gatewayApi)({
                headers,
                args,
                ctx,
                requestId,
            });

            res.status(200).send(result.responseData);
        } catch (err) {
            const {error} = err as any;
            if (error) {
                res.status(typeof error.status === 'number' ? error.status : 500).send(error);
            } else {
                return boundeHandler(500, 'Unknown error');
            }
        }
    };
}
