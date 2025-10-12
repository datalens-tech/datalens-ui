import {extendZodWithOpenApi} from '@asteasolutions/zod-to-openapi';
import {z} from 'zod';

extendZodWithOpenApi(z);

export {oldSchema} from './old-schema';
export type {schema, authSchema} from './schema';

export * from './constants';
export * from './modules';
export * from './types';
export * from './utils';
