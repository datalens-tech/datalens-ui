import type {ApiServiceActionConfig} from '@gravity-ui/gateway';

import type {anonymousSchema, authSchema, schema} from '../../shared/schema';

export type DatalensGatewaySchemas = {
    root: typeof schema;
    auth: typeof authSchema;
    anonymous: typeof anonymousSchema;
};

export type AnyApiServiceActionConfig = ApiServiceActionConfig<any, any, any, any, any, any>;
