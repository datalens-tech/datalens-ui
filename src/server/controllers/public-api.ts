import type {Request, Response} from '@gravity-ui/expresskit';
import {REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';
import _ from 'lodash';
import z from 'zod/v4';

import {getValidationSchema, hasValidationSchema} from '../../shared/schema/gateway-utils';
import {openApiRegistry} from '../components/app-docs';
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

const parseRoute = (route: string) => {
    const spacerIndex = route.indexOf(' ');
    const method = route.slice(0, spacerIndex).trim();
    const url = route.slice(spacerIndex).trim();

    return {
        method,
        url,
        reverse: (props: {version: string; action: string}) => {
            return url.replace(':version', props.version).replace(':action', props.action);
        },
    };
};

const defaultSchema = {
    summary: 'Type not defined',
    request: {
        body: {
            content: {
                ['application/json']: {
                    schema: z.toJSONSchema(z.any()),
                },
            },
        },
    },
    responses: {
        200: {
            description: 'TBD',
            content: {
                ['application/json']: {
                    schema: z.toJSONSchema(z.any()),
                },
            },
        },
    },
};

export function publicApiControllerGetter(params: any) {
    const parsedRoute = parseRoute(params.route);
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
    const proxyMap = registry.getPublicApiProxyMap();

    Object.entries(proxyMap).forEach(([version, actions]) => {
        Object.entries(actions).forEach(([action, {resolve, openApi}]) => {
            const gatewayApiAction = resolve(gatewayApi);

            if (hasValidationSchema(gatewayApiAction)) {
                openApiRegistry.registerPath({
                    method: parsedRoute.method.toLocaleLowerCase(),
                    path: parsedRoute.reverse({version, action}),
                    ...openApi,
                    ...getValidationSchema(gatewayApiAction)().getOpenApiSchema(),
                    security: [{['Access token']: [], ['Access token 2']: []}],
                });
            } else {
                openApiRegistry.registerPath({
                    method: parsedRoute.method.toLocaleLowerCase(),
                    path: parsedRoute.reverse({version, action}),
                    ...openApi,
                    ...defaultSchema,
                    security: [{['Access token']: [], ['Access token 2']: []}],
                } as any);
            }
        });
    });

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
