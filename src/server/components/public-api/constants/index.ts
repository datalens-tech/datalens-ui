import type {PublicApiBaseConfig} from '../types';

import {PUBLIC_API_V0_CONFIG} from './v0';
import {PUBLIC_API_VNULL_CONFIG} from './vNull';

export {PUBLIC_API_VERSION_HEADER, PUBLIC_API_VERSION_HEADER_LATEST_VALUE} from './common';

export const PUBLIC_API_HTTP_METHOD = 'POST';
export const PUBLIC_API_URL = '/rpc/:action';
export const PUBLIC_API_ROUTE = `${PUBLIC_API_HTTP_METHOD} ${PUBLIC_API_URL}`;

export const PUBLIC_API_VERSION = {
    vNull: 'vnull',
    v0: 'v0',
} as const;

export const PUBLIC_API_LATEST_VERSION = PUBLIC_API_VERSION.v0;

export const PUBLIC_API_BASE_CONFIG = {
    [PUBLIC_API_VERSION.vNull]: PUBLIC_API_VNULL_CONFIG,

    [PUBLIC_API_VERSION.v0]: PUBLIC_API_V0_CONFIG,
} satisfies PublicApiBaseConfig;
