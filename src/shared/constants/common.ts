import {ACTION_PARAM_PREFIX} from '@gravity-ui/dashkit';

export enum AppInstallation {
    Opensource = 'opensource',
}

export enum AppEnvironment {
    Production = 'production',
    Preprod = 'preprod',
    Development = 'development',
    Staging = 'staging',
    Prod = 'prod',
}

export enum AppMode {
    Full = 'full',
    Datalens = 'datalens',
    Charts = 'charts',
}

export enum Language {
    Ru = 'ru',
    En = 'en',
}

export enum DeviceType {
    Phone = 'phone',
    Tablet = 'tablet',
    Desktop = 'desktop',
}

export const DEFAULT_PAGE_SIZE = 1000;

export const ENABLE = 'enable';
export const DISABLE = 'disable';

export const FALLBACK_LANGUAGES = [Language.En];

export const USER_SETTINGS_KEY = 'userSettings';

export const URL_ACTION_PARAMS_PREFIX = ACTION_PARAM_PREFIX;

export const DEFAULT_CHART_LINES_LIMIT = 100;

export const DEFAULT_DATE_FORMAT = 'DD.MM.YYYY';
