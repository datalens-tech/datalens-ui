import {getTypedApiFactory} from '@gravity-ui/gateway';

import type {anonymousSimpleSchema} from './anonymous-schema/simple-schema';
import auth from './auth';
import type {authSimpleSchema} from './auth-schema/simple-schema';
import bi from './bi';
import biConverter from './bi-converter';
import extensions from './extensions';
import metaManager from './meta-manager';
import us from './us';
import usPrivate from './us-private';

// Scheme for all local requests except mix
export const simpleSchema = {
    us,
    usPrivate,
    bi,
    biConverter,
    extensions,
    auth,
    metaManager,
};

export const getTypedApi = getTypedApiFactory<{
    root: typeof simpleSchema;
    auth: typeof authSimpleSchema;
    anonymous: typeof anonymousSimpleSchema;
}>();

export type TypedApi = ReturnType<typeof getTypedApi>;
