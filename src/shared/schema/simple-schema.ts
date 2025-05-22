import {getTypedApiFactory} from '@gravity-ui/gateway';

import auth from './auth';
import type {authSimpleSchema} from './auth-schema/simple-schema';
import bi from './bi';
import biConverter from './bi-converter';
import extensions from './extensions';
import metaManager from './meta-manager';
import publicGallery from './public-gallery';
import us from './us';

// Scheme for all local requests except mix
export const simpleSchema = {
    us,
    bi,
    biConverter,
    extensions,
    auth,
    metaManager,
    publicGallery,
};

export const getTypedApi = getTypedApiFactory<{
    root: typeof simpleSchema;
    auth: typeof authSimpleSchema;
}>();

export type TypedApi = ReturnType<typeof getTypedApi>;
