import mix from './mix';
import {simpleSchema} from './simple-schema';

export {authSchema} from './auth-schema';
export {anonymousSchema} from './anonymous-schema';

export const schema = {
    ...simpleSchema,
    mix,
};

export * from './types';
