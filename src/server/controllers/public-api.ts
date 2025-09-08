import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiServiceActionConfig} from '@gravity-ui/gateway';
import {AppError, REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';
import _ from 'lodash';
import {ZodError} from 'zod/v4';

import {getValidationSchema} from '../../shared/schema/gateway-utils';
import type {PublicApiRpcMap} from '../components/public-api/types';
import {PUBLIC_API_RPC_ERROR_CODE} from '../constants/public-api';
import {registry} from '../registry';
import type {DatalensGatewaySchemas} from '../types/gateway';
import Utils from '../utils';

const handleError = (
    req: Request,
    res: Response,
    status: number,
    message: string,
    details?: unknown,
) => {
    res.status(status).send({
        status,
        code: PUBLIC_API_RPC_ERROR_CODE,
        message,
        requestId: req.ctx.get(REQUEST_ID_PARAM_NAME) || '',
        details,
    });
};

export const createPublicApiController = () => {
    const {gatewayApi} = registry.getGatewayApi<DatalensGatewaySchemas>();
    const schemasByScope = registry.getGatewaySchemasByScope();
    const {proxyMap} = registry.getPublicApiConfig();

    const actionToPathMap = new Map<Function, {serviceName: string; actionName: string}>();

    Object.entries(gatewayApi).forEach(([serviceName, actions]) => {
        Object.entries(actions).forEach(([actionName, action]) => {
            actionToPathMap.set(action, {serviceName, actionName});
        });
    });

    const actionToConfigMap = new Map<
        Function,
        ApiServiceActionConfig<any, any, any, any, any, any>
    >();

    Object.values(proxyMap).forEach((actions) => {
        Object.values(actions).forEach(({resolve}) => {
            const gatewayAction = resolve(gatewayApi);
            const pathObject = actionToPathMap.get(gatewayAction);

            if (!pathObject) {
                throw new AppError('Public api proxyMap action not found in gatewayApi.');
            }

            const actionConfig =
                schemasByScope.root[pathObject.serviceName].actions[pathObject.actionName];

            actionToConfigMap.set(gatewayAction, actionConfig);
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

            const headers = Utils.pickRpcHeaders(req);
            const args = req.body;
            const requestId = ctx.get(REQUEST_ID_PARAM_NAME) || '';

            const gatewayAction = action.resolve(gatewayApi);
            const gatewayActionConfig = actionToConfigMap.get(gatewayAction);

            if (!gatewayActionConfig) {
                return boundeHandler(404, 'Action not found');
            }

            const validationSchema = getValidationSchema(gatewayActionConfig);

            if (!validationSchema) {
                return boundeHandler(404, 'Validation schema not found');
            }

            const {paramsSchema} = validationSchema;

            try {
                const validatedArgs = await paramsSchema.parseAsync(args);

                const result = await gatewayAction({
                    headers,
                    args: validatedArgs,
                    ctx,
                    requestId,
                });

                res.status(200).send(result.responseData);
            } catch (error) {
                if (error instanceof ZodError) {
                    return boundeHandler(400, 'Validation error', error.issues);
                } else {
                    throw error;
                }
            }
        } catch (err) {
            const {error} = err as any;
            if (error) {
                res.status(typeof error.status === 'number' ? error.status : 500).send(error);
            } else {
                return boundeHandler(500, 'Unknown error');
            }
        }
    };
};
