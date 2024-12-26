import mix from './mix';
import {simpleSchema} from './simple-schema';
export {authSchema} from './auth';

export const schema = {
    ...simpleSchema,
    mix,
};

export * from './types';
export * from './constants';
