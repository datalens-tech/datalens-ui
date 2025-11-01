import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiServiceActionConfig, GetAuthHeaders} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';
import type z from 'zod';

import {AuthHeader, SERVICE_USER_ACCESS_TOKEN_HEADER} from '../constants';

export const getAuthHeadersNone = () => undefined;

export function createAction<TOutput, TParams = undefined, TTransformed = TOutput>(
    config: ApiServiceActionConfig<AppContext, Request, Response, TOutput, TParams, TTransformed>,
) {
    return config;
}

type TypedActionSchema = {
    paramsSchema: z.ZodType;
    resultSchema: z.ZodType;
};

const VALIDATION_SCHEMA_KEY = Symbol('$schema');

const registerValidationSchema = <T extends object>(value: T, schema: TypedActionSchema): T => {
    Object.defineProperty(value, VALIDATION_SCHEMA_KEY, {
        value: schema,
        configurable: true,
    });

    return value;
};

export const hasValidationSchema = (
    value: object,
): value is {[VALIDATION_SCHEMA_KEY]: TypedActionSchema} => {
    return Object.prototype.hasOwnProperty.call(value, VALIDATION_SCHEMA_KEY);
};

export const getValidationSchema = (value: object): TypedActionSchema | null => {
    return hasValidationSchema(value) ? value[VALIDATION_SCHEMA_KEY] : null;
};

export const createTypedAction = <TOutput, TParams, TTransformed = TOutput>(
    schema: {
        resultSchema: z.ZodType<TOutput>;
        paramsSchema: z.ZodType<TParams>;
        transformedSchema?: z.ZodType<TTransformed>;
    },
    actionConfig: ApiServiceActionConfig<
        AppContext,
        Request,
        Response,
        NoInfer<TOutput>,
        NoInfer<TParams>,
        NoInfer<TTransformed>
    >,
) => {
    const schemaValidationObject = {
        paramsSchema: schema.paramsSchema,
        resultSchema: schema.resultSchema,
    };

    return registerValidationSchema(actionConfig, schemaValidationObject);
};

export const createExtendedTypedAction =
    <TConfigOutput, TConfigParams, TConfigTransformed = TConfigOutput>(
        actionConfig: ApiServiceActionConfig<
            AppContext,
            Request,
            Response,
            TConfigOutput,
            TConfigParams,
            TConfigTransformed
        >,
    ) =>
    <TResult extends TConfigTransformed, TParams extends TConfigParams>(schema: {
        resultSchema: z.ZodType<TResult>;
        paramsSchema: z.ZodType<TParams>;
    }) => {
        const schemaValidationObject = {
            paramsSchema: schema.paramsSchema,
            resultSchema: schema.resultSchema,
        };

        return registerValidationSchema(
            actionConfig as unknown as ApiServiceActionConfig<
                AppContext,
                Request,
                Response,
                TConfigOutput,
                TParams,
                TResult
            >,
            schemaValidationObject,
        );
    };

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
