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
    v0: 'v0',
} as const;

export const PUBLIC_API_LATEST_VERSION = PUBLIC_API_VERSION.v0;
