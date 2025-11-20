import type {OpenAPIRegistry} from '@asteasolutions/zod-to-openapi';
import type {ComponentsObject} from '@asteasolutions/zod-to-openapi/dist/types';
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
    experimental?: boolean;
};

export type PublicApiAction<TSchema extends SchemasByScope, TFeature> = {
    resolve: (
        api: ApiWithRoot<TSchema, Request['ctx'], Request, Response>,
    ) => (params: any) => Promise<GatewayActionUnaryResponse<unknown>>;
    openApi: PublicApiActionOpenApi;
    features?: TFeature[];
};

export type PublicApiVersionActions<TSchema extends SchemasByScope, TFeature> = Record<
    string,
    PublicApiAction<TSchema, TFeature>
>;

type PublicApiVersionOpenApi = {
    registry: OpenAPIRegistry;
};

export type PublicApiVersionConfig<
    TSchema extends SchemasByScope = DatalensGatewaySchemas,
    TFeature = string,
> = {
    actions: PublicApiVersionActions<TSchema, TFeature>;
    openApi: PublicApiVersionOpenApi;
};

export type PublicApiBaseConfig<
    TSchema extends SchemasByScope = DatalensGatewaySchemas,
    TFeature extends string = string,
> = Record<`${PublicApiVersion}`, PublicApiVersionConfig<TSchema, TFeature>>;

export type PublicApiSecuritySchemes = Record<string, SecuritySchemeObject>;

export type PublicApiConfig<TSchema extends SchemasByScope = DatalensGatewaySchemas> = {
    baseConfig: PublicApiBaseConfig<TSchema>;
    securitySchemes: PublicApiSecuritySchemes;
    securityTypes: string[];
    biOpenapiSchemas?: ComponentsObject['schemas'];
};
