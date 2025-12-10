import {getTypedApiFactory} from '@gravity-ui/gateway';

import auth from './auth';
import type {authSchema} from './auth-schema';
import bi from './bi';
import biConverter from './bi-converter';
import extensions from './extensions';
import metaManager from './meta-manager';
import mix from './mix';
import us from './us';
import usPrivate from './us-private';

export {authSchema} from './auth-schema';

export const schema = {
    us,
    usPrivate,
    bi,
    biConverter,
    extensions,
    auth,
    metaManager,
    mix,
};

export * from './types';

export const getTypedApi = getTypedApiFactory<{
    root: typeof schema;
    auth: typeof authSchema;
}>();

export type TypedApi = ReturnType<typeof getTypedApi>;
