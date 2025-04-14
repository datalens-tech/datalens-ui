import type {authSchema, schema} from '../../shared/schema';

export type DatalensGatewaySchemas = {root: typeof schema; auth: typeof authSchema};
