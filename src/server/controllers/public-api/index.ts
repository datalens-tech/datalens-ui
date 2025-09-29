import type {Request, Response} from '@gravity-ui/expresskit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';

import {registry} from '../../registry';
import type {DatalensGatewaySchemas} from '../../types/gateway';
import Utils from '../../utils';

import {PUBLIC_API_ERRORS, PublicApiError} from './constants';
import {parseRequestApiVersion, prepareError, validateRequestBody} from './utils';

export const createPublicApiController = () => {
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
    const {baseConfig} = registry.getPublicApiConfig();

    return async function publicApiController(req: Request, res: Response) {
        try {
            const {action: actionName} = req.params;

            const version = parseRequestApiVersion(req);

            if (!actionName || !baseConfig[version].actions[actionName]) {
                throw new PublicApiError(`Endpoint ${req.path} does not exist`, {
                    code: PUBLIC_API_ERRORS.ENDPOINT_NOT_FOUND,
                });
            }

            const action = baseConfig[version].actions[actionName];

            const {ctx} = req;

            const headers = Utils.pickRpcHeaders(req);
            const requestId = ctx.get(REQUEST_ID_PARAM_NAME) || '';

            const gatewayAction = action.resolve(gatewayApi);

            const validatedArgs = await validateRequestBody(action.schemas.args, req.body);

            const result = await gatewayAction({
                headers,
                args: validatedArgs,
                ctx,
                requestId,
            });

            res.status(200).send(result);
        } catch (err: unknown) {
            const {status, message, code, details} = prepareError(err);

            res.status(status).send({
                status,
                code,
                message,
                requestId: req.ctx.get(REQUEST_ID_PARAM_NAME) || '',
                details,
            });
        }
    };
};
