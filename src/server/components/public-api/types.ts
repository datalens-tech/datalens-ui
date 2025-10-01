import type {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiWithRoot, GatewayActionUnaryResponse, SchemasByScope} from '@gravity-ui/gateway';

import type {ValueOf} from '../../../shared';
import type {DatalensGatewaySchemas} from '../../types/gateway';
import type {SecuritySchemeObject} from '../api-docs';

import type {PUBLIC_API_VERSION} from './constants';

export type PublicApiVersion = ValueOf<typeof PUBLIC_API_VERSION>;

export type PublicApiActionOpenApi = {
    summary: string;
    tags?: string[];
};

export type PublicApiAction<TSchema extends SchemasByScope> = {
    resolve: (
        api: ApiWithRoot<TSchema, Request['ctx'], Request, Response>,
    ) => (params: any) => Promise<GatewayActionUnaryResponse<unknown>>;
    openApi: PublicApiActionOpenApi;
};

type PublicApiVersionActions<TSchema extends SchemasByScope> = Record<
    string,
    PublicApiAction<TSchema>
>;

type PublicApiVersionOpenApi = {
    registry: OpenAPIRegistry;
};

export type PublicApiVersionConfig<TSchema extends SchemasByScope = DatalensGatewaySchemas> = {
    actions: PublicApiVersionActions<TSchema>;
    openApi: PublicApiVersionOpenApi;
};

export type PublicApiBaseConfig<TSchema extends SchemasByScope = DatalensGatewaySchemas> = Record<
    PublicApiVersion,
    PublicApiVersionConfig<TSchema>
>;

export type PublicApiSecuritySchemes = Record<string, SecuritySchemeObject>;

export type PublicApiConfig<TSchema extends SchemasByScope = DatalensGatewaySchemas> = {
    baseConfig: PublicApiBaseConfig<TSchema>;
    securitySchemes: PublicApiSecuritySchemes;
    securityTypes: string[];
};
