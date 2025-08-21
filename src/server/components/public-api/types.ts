import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiWithRoot, SchemasByScope} from '@gravity-ui/gateway';

import type {DatalensGatewaySchemas} from '../../types/gateway';
import type {SecuritySchemeObject} from '../api-docs/types';

type HeadersType = Record<string, string | string[] | undefined>;

export type PublicApiRpcMap<TSchema extends SchemasByScope = DatalensGatewaySchemas> = Record<
    string,
    Record<
        string,
        {
            resolve: (api: ApiWithRoot<TSchema, Request['ctx'], Request, Response>) => any;
            headers?: (req: Request, headers: HeadersType) => HeadersType;
            args?: (req: Request) => Promise<object> | object;
            openApi: {
                summary: string;
                tags?: string[];
            };
        }
    >
>;

export type PublicApiSecuritySchemes = Record<string, SecuritySchemeObject>;

export type PublicApiConfig<TSchema extends SchemasByScope = DatalensGatewaySchemas> = {
    proxyMap: PublicApiRpcMap<TSchema>;
    securitySchemes: PublicApiSecuritySchemes;
    securityTypes: string[];
};
