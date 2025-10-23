import type {ValueOf} from '../../../../shared';

export enum ApiTag {
    Connection = 'Connection',
    Dataset = 'Dataset',
    Wizard = 'Wizard',
    Dashboard = 'Dashboard',
    QL = 'QL',
}

export const PUBLIC_API_VERSION_HEADER = 'x-dl-api-version';

export const PUBLIC_API_VERSION_HEADER_LATEST_VALUE = 'latest';

export const OPEN_API_VERSION_HEADER_COMPONENT_NAME = 'ApiVersionHeader';

export const PUBLIC_API_HTTP_METHOD = 'POST';
export const PUBLIC_API_URL = '/rpc/:action';
export const PUBLIC_API_ROUTE = `${PUBLIC_API_HTTP_METHOD} ${PUBLIC_API_URL}`;

export const PUBLIC_API_VERSION = {
    v0: 0,
} as const satisfies Record<string, number>;

export const PUBLIC_API_LATEST_VERSION = Math.max(...Object.values(PUBLIC_API_VERSION)) as ValueOf<
    typeof PUBLIC_API_VERSION
>;
