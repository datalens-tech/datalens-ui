import type {Request, Response} from '@gravity-ui/expresskit';
import {AppError, REQUEST_ID_PARAM_NAME} from '@gravity-ui/nodekit';
import _ from 'lodash';

import {getValidationSchema} from '../../../shared/schema/gateway-utils';
import {registerActionToOpenApi} from '../../components/public-api';
import {registry} from '../../registry';
import type {AnyApiServiceActionConfig, DatalensGatewaySchemas} from '../../types/gateway';
import Utils from '../../utils';

import {PUBLIC_API_ERRORS, PublicApiError} from './constants';
import {prepareError, validateRequestBody} from './utils';

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
        try {
            const {version, action: actionName} = req.params;

            if (!version || !actionName || !proxyMap[version] || !proxyMap[version][actionName]) {
                throw new PublicApiError(`Endpoint ${req.path} does not exist`, {
                    code: PUBLIC_API_ERRORS.ENDPOINT_NOT_FOUND,
                });
            }

            const action = proxyMap[version][actionName];

            const {ctx} = req;

            const headers = Utils.pickRpcHeaders(req);
            const requestId = ctx.get(REQUEST_ID_PARAM_NAME) || '';

            const gatewayAction = action.resolve(gatewayApi);
            const gatewayActionConfig = actionToConfigMap.get(gatewayAction);

            if (!gatewayActionConfig) {
                req.ctx.logError(`Couldn't find action config in actionToConfigMap`);
                throw new PublicApiError(PUBLIC_API_ERRORS.ACTION_CONFIG_NOT_FOUND, {
                    code: PUBLIC_API_ERRORS.ACTION_CONFIG_NOT_FOUND,
                });
            }

            const validationSchema = getValidationSchema(gatewayActionConfig);

            if (!validationSchema) {
                req.ctx.logError(`Couldn't find action validation schema`);
                throw new PublicApiError(PUBLIC_API_ERRORS.ACTION_VALIDATION_SCHEMA_NOT_FOUND, {
                    code: PUBLIC_API_ERRORS.ACTION_VALIDATION_SCHEMA_NOT_FOUND,
                });
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
