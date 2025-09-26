import {PUBLIC_API_VERSION} from '../constants';
import type {PublicApiBaseConfig} from '../types';

import {PUBLIC_API_V0_CONFIG} from './v0';

export const PUBLIC_API_BASE_CONFIG = {
    [PUBLIC_API_VERSION.v0]: PUBLIC_API_V0_CONFIG,
} satisfies PublicApiBaseConfig;
