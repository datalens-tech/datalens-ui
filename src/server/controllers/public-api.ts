import type {Request, Response} from '@gravity-ui/expresskit';
import {AppError, REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';
import _ from 'lodash';
import type z from 'zod/v4';
import {ZodError} from 'zod/v4';

import {getValidationSchema} from '../../shared/schema/gateway-utils';
import {registerActionToOpenApi} from '../components/public-api';
import {PUBLIC_API_RPC_ERROR_CODE} from '../constants/public-api';
import {registry} from '../registry';
import type {AnyApiServiceActionConfig, DatalensGatewaySchemas} from '../types/gateway';
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

const validateRequestBody = async (schema: z.ZodType, data: unknown): Promise<unknown> => {
    try {
        return await schema.parseAsync(data);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new AppError('Validation error', {
                details: error.issues,
            });
        }

        throw error;
    }
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

    const actionToConfigMap = new Map<Function, AnyApiServiceActionConfig>();

    Object.entries(proxyMap).forEach(([version, actions]) => {
        Object.entries(actions).forEach(([actionName, {resolve, openApi}]) => {
            const gatewayAction = resolve(gatewayApi);
            const pathObject = actionToPathMap.get(gatewayAction);

            if (!pathObject) {
                throw new AppError('Public api proxyMap action not found in gatewayApi.');
            }

            const actionConfig =
                schemasByScope.root[pathObject.serviceName].actions[pathObject.actionName];

            actionToConfigMap.set(gatewayAction, actionConfig);

            registerActionToOpenApi({actionConfig, actionName, version, openApi});
        });
    });

    return async function publicApiController(req: Request, res: Response) {
        const boundHandler = handleError.bind(null, req, res);

        try {
            const {version, action: actionName} = req.params;

            if (!version) {
                return boundHandler(400, 'Invalid params, version is empty');
            }

            if (!actionName) {
                return boundHandler(400, 'Invalid params, action is empty');
            }

            const versionMap = proxyMap[version];
            if (!versionMap) {
                return boundHandler(404, 'Version not found');
            }

            const action = versionMap[actionName];
            if (!action) {
                return boundHandler(404, 'Action not found');
            }

            const {ctx} = req;

            const headers = Utils.pickRpcHeaders(req);
            const requestId = ctx.get(REQUEST_ID_PARAM_NAME) || '';

            const gatewayAction = action.resolve(gatewayApi);
            const gatewayActionConfig = actionToConfigMap.get(gatewayAction);

            if (!gatewayActionConfig) {
                return boundHandler(500, 'Action not found');
            }

            const validationSchema = getValidationSchema(gatewayActionConfig);

            if (!validationSchema) {
                return boundHandler(500, 'Validation schema not found');
            }

            const {paramsSchema} = validationSchema;

            const validatedArgs = await validateRequestBody(paramsSchema, req.body);

            const result = await gatewayAction({
                headers,
                args: validatedArgs,
                ctx,
                requestId,
            });

            res.status(200).send(result.responseData);
        } catch (err) {
            const {error} = err as any;
            if (error) {
                res.status(typeof error.status === 'number' ? error.status : 500).send(error);
            } else {
                return boundHandler(500, 'Unknown error');
            }
        }
    };
};
