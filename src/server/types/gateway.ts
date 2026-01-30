import type {ApiServiceActionConfig} from '@gravity-ui/gateway';

import type {authSchema, schema} from '../../shared/schema';

export type DatalensGatewaySchemas = {
    root: typeof schema;
    auth: typeof authSchema;
};

export type AnyApiServiceActionConfig = ApiServiceActionConfig<any, any, any, any, any, any>;
