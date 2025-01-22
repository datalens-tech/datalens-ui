import {getTypedApiFactory} from '@gravity-ui/gateway';

import type {authSimpleSchema} from './auth/simple-schema';
import bi from './bi';
import biConverter from './bi-converter';
import extensions from './extensions';
import us from './us';

// Scheme for all local requests except mix
export const simpleSchema = {
    us,
    bi,
    biConverter,
    extensions,
};

export const getTypedApi = getTypedApiFactory<{
    root: typeof simpleSchema;
    auth: typeof authSimpleSchema;
}>();

export type TypedApi = ReturnType<typeof getTypedApi>;
