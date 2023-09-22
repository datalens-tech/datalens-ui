import {removeLastSlash} from '../utils';

import {opensourceEndpoints} from './opensource';

export const endpoints = removeLastSlash(
    opensourceEndpoints,
) as unknown as typeof opensourceEndpoints;
