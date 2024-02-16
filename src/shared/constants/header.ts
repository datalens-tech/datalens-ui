export enum AuthHeader {
    Cookie = 'cookie',
    Authorization = 'authorization',
}

export enum SuperuserHeader {
    XDlAllowSuperuser = 'x-dl-allow-superuser',
    XDlSudo = 'x-dl-sudo',
}

// header for extending response with specific data for ui or backend
// example: add authorship for ui
export enum DlComponentHeader {
    UI = 'ui',
    Backend = 'backend',
}

export const REQUEST_ID_HEADER = 'x-request-id';
export const TRACE_ID_HEADER = 'x-trace-id';
export const SERVER_TRACE_ID_HEADER = 'x-server-trace-id';
export const US_MASTER_TOKEN_HEADER = 'x-us-master-token';
export const DL_CONTEXT_HEADER = 'x-dl-context';
export const FORWARDED_FOR_HEADER = 'x-forwarded-for';
export const ACCEPT_LANGUAGE_HEADER = 'accept-language';
export const TIMEZONE_OFFSET_HEADER = 'x-timezone-offset';
export const US_PUBLIC_API_TOKEN_HEADER = 'x-us-public-api-token';
export const CSRF_TOKEN_HEADER = 'x-csrf-token';
export const DLS_API_KEY_HEADER = 'x-api-key';
export const DASH_INFO_HEADER = 'x-dash-info';
export const DL_COMPONENT_HEADER = 'x-dl-component';
export const DL_EMBED_TOKEN_HEADER = 'x-dl-embed-token';
export const TENANT_ID_HEADER = 'x-dl-tenantid';
export const WORKBOOK_ID_HEADER = 'x-dl-workbookid';
export const PROJECT_ID_HEADER = 'x-dc-projectid';
