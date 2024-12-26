import {getTypedApiFactory} from '@gravity-ui/gateway';

import auth from './auth';
import bi from './bi';
import biConverter from './bi-converter';
import extensions from './extensions';
import us from './us';

// Scheme for all local requests except mix
export const simpleSchema = {
    auth,
    us,
    bi,
    biConverter,
    extensions,
};

export const getTypedApi = getTypedApiFactory<{root: typeof simpleSchema}>();

export type TypedApi = ReturnType<typeof getTypedApi>;
