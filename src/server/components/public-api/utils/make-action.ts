import type {Request, Response} from '@gravity-ui/expresskit';
import type {ApiActionConfig, ApiWithRoot, SchemasByScope} from '@gravity-ui/gateway';
import type {AppContext} from '@gravity-ui/nodekit';
import type z from 'zod/v4';

import type {DatalensGatewaySchemas} from '../../../types/gateway';
import type {PublicApiVersionAction} from '../types';

export const makeAction = <
    TSchema extends SchemasByScope = DatalensGatewaySchemas,
    P extends z.ZodTypeAny = z.ZodTypeAny,
    R extends z.ZodTypeAny = z.ZodTypeAny,
>(opts: {
    schemas: {args: P; result: R};
    resolve: (
        api: ApiWithRoot<TSchema, Request['ctx'], Request, Response>,
        schemas: {args: P; result: R},
    ) => (args: ApiActionConfig<AppContext, z.infer<P>, z.infer<R>>) => Promise<z.infer<R>>;
    openApi: {
        summary: string;
        tags: string[];
    };
}): PublicApiVersionAction<TSchema> => {
    return {
        schemas: opts.schemas,
        resolve: (api) => opts.resolve(api, opts.schemas),
        openApi: opts.openApi,
    };
};
