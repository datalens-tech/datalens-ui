import {getTypedApiFactory} from '@gravity-ui/gateway';

import bi from './bi';
import biConverter from './bi-converter';
import extensions from './extensions';
import googleapis from './googleapis';
import us from './us';

// Scheme for all local requests except mix
export const simpleSchema = {
    us,
    bi,
    biConverter,
    googleapis,
    extensions,
};

export const getTypedApi = getTypedApiFactory<{root: typeof simpleSchema}>();
