import type {Request, Response} from '@gravity-ui/expresskit';
import type {
    ApiServiceActionConfig,
    ApiServiceMixedActionConfig,
    ApiServiceRestActionConfig,
    GetAuthHeaders,
} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';
import z from 'zod/v4';

import {AuthHeader, SERVICE_USER_ACCESS_TOKEN_HEADER} from '../constants';

export const getAuthHeadersNone = () => undefined;

export function createAction<TOutput, TParams = undefined, TTransformed = TOutput>(
    config: ApiServiceActionConfig<AppContext, Request, Response, TOutput, TParams, TTransformed>,
) {
    return config;
}

function isRestActionConfig(
    actionConfig: ApiServiceActionConfig<any, any, any, any, any, any>,
): actionConfig is ApiServiceRestActionConfig<any, any, any> {
    return Boolean((actionConfig as ApiServiceRestActionConfig<any, any>).method);
}

function isMixedActionConfig(
    actionConfig: ApiServiceActionConfig<any, any, any, any, any, any>,
): actionConfig is ApiServiceMixedActionConfig<any, any, any, any, any, any> {
    return typeof actionConfig === 'function';
}

const VALIDATION_SCHEMA_KEY = Symbol('$schema');

export const registerValidationSchema = <T = ApiServiceActionConfig<any, any, any, any, any, any>>(
    actionConfig: T,
    schema: any,
) => {
    Object.defineProperty(actionConfig, VALIDATION_SCHEMA_KEY, {
        value: schema,
        enumerable: false,
    });

    return actionConfig;
};

export const hasValidationSchema = <T = ApiServiceActionConfig<any, any, any, any, any, any>>(
    actionConfig: T,
) => {
    return Object.hasOwnProperty.call(actionConfig, VALIDATION_SCHEMA_KEY);
};

export const getValidationSchema = <T = ApiServiceActionConfig<any, any, any, any, any, any>>(
    actionConfig: T,
) => {
    return hasValidationSchema(actionConfig) ? (actionConfig as any)[VALIDATION_SCHEMA_KEY] : null;
};

const CONTENT_TYPE_JSON = 'application/json';

export function createTypedAction<
    TOutputSchema extends z.ZodType,
    TParamsSchema extends z.ZodType,
    TTransformedSchema extends z.ZodType = TOutputSchema,
    TOutput = z.infer<TOutputSchema>,
    TParams = z.infer<TParamsSchema>,
    TTransformed = z.infer<TTransformedSchema>,
>(schema: {bodySchema: TOutputSchema; argsSchema: TParamsSchema}) {
    type ActionConfig = ApiServiceActionConfig<
        AppContext,
        Request,
        Response,
        TOutput,
        TParams,
        TTransformed
    >;

    const shemaValidationObject = {
        getSchema() {
            return schema;
        },
        getOpenApichema() {
            return {
                summary: 'Action summary',
                // tags: [ApiTag.Workbooks],
                request: {
                    body: {
                        content: {
                            [CONTENT_TYPE_JSON]: {
                                schema: z.toJSONSchema(schema.argsSchema),
                            },
                        },
                    },
                },
                responses: {
                    200: {
                        description: 'Response',
                        content: {
                            [CONTENT_TYPE_JSON]: {
                                schema: z.toJSONSchema(schema.bodySchema),
                            },
                        },
                    },
                },
            };
        },
    };

    const action = (actionConfig: ActionConfig) =>
        registerValidationSchema<ActionConfig>(actionConfig, shemaValidationObject);

    action.withValidationSchema = (actionConfig: ActionConfig) => {
        if (isRestActionConfig(actionConfig)) {
            return registerValidationSchema<ActionConfig>(
                {
                    ...actionConfig,
                    validationSchema: z.toJSONSchema(schema.argsSchema, {
                        target: 'draft-7',
                        io: 'input',
                    }),
                },
                shemaValidationObject,
            );
        } else if (isMixedActionConfig(actionConfig)) {
            return action(actionConfig); // TODO add validation
        }

        return action(actionConfig);
    };

    return action;
}

type AuthArgsData = {
    userAccessToken?: string;
    serviceUserAccessToken?: string;
    accessToken?: string;
};

export const getAuthArgs = (req: Request, _res: Response): AuthArgsData => {
    return {
        // zitadel
        userAccessToken: req.user?.accessToken,
        serviceUserAccessToken: req.serviceUserAccessToken,
        // auth
        accessToken: req.ctx.get('user')?.accessToken,
    };
};

const createGetAuthHeaders: () => GetAuthHeaders<AuthArgsData> = () => (params) => {
    const {authArgs} = params;

    const resultHeaders = {};

    // zitadel
    if (authArgs?.userAccessToken) {
        Object.assign(resultHeaders, {
            [AuthHeader.Authorization]: `Bearer ${authArgs.userAccessToken}`,
        });
    }
    // zitadel
    if (authArgs?.serviceUserAccessToken) {
        Object.assign(resultHeaders, {
            [SERVICE_USER_ACCESS_TOKEN_HEADER]: authArgs.serviceUserAccessToken,
        });
    }
    // auth
    if (authArgs?.accessToken) {
        Object.assign(resultHeaders, {
            [AuthHeader.Authorization]: `Bearer ${authArgs.accessToken}`,
        });
    }

    return resultHeaders;
};

export const getAuthHeaders: GetAuthHeaders<AuthArgsData> = createGetAuthHeaders();
