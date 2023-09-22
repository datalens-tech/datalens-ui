import mix from './mix';
import {simpleSchema} from './simple-schema';

export const schema = {
    ...simpleSchema,
    mix,
};

export * from './types';
export * from './constants';
