import {ColorPalette, selectPaletteById} from '../../shared';
import {registry} from '../registry';

const THEME_OVERRIDE_QUERY_PARAM_NAME = '_theme';
const LANG_OVERRIDE_QUERY_PARAM_NAME = '_lang';
const EMBEDD_QUERY_PARAM_NAME = '_embedded';
const YC_THEME_OVERRIDE_COOKIE_NAME = 'yc_theme';
const YC_LANG_OVERRIDE_COOKIE_NAME = 'yc_lang';
const YC_OVERRIDE_COOKIE_VALUE_REG = /^[a-z]+$/;

const DASH_API_BASE_URL = '/api/dash/v1/dashboards';
const CHARTS_API_BASE_URL = '/api/charts/v1/charts';
const YAV_API_BASE_URL = '/api/yav';

const DASH_DEFAULT_NAMESPACE = 'default';

const DASH_ENTRY_RELEVANT_FIELDS = [
    'entryId',
    'data',
    'key',
    'links',
    'meta',
    'permissions',
    'scope',
    'type',
    'public',
    'isFavorite',

    'createdAt',
    'createdBy',
    'updatedAt',
    'updatedBy',

    'revId',
    'savedId',
    'publishedId',

    'workbookId',
];

const BASE_PROJECT_NAME = 'datalens';

const BLOCK_STAT = {
    RU: '28',
    DATALENS: '3995',
    EXTERNAL: '1105',
    INTERNAL: '1649',
    UI: '2819',
    SERVER: '2443',
};

const WORLD_REGION = 10000;

const selectServerPalette = (
    palette?: string,
    loadedColorPalettes?: Record<string, ColorPalette>,
) => {
    if (palette && loadedColorPalettes && loadedColorPalettes[palette]) {
        return loadedColorPalettes[palette].colors;
    } else {
        const getAvailablePalettesMap = registry.common.functions.get('getAvailablePalettesMap');

        return selectPaletteById(palette, getAvailablePalettesMap());
    }
};

const SERVICE_NAME_DATALENS = 'DataLens';

export {
    THEME_OVERRIDE_QUERY_PARAM_NAME,
    LANG_OVERRIDE_QUERY_PARAM_NAME,
    EMBEDD_QUERY_PARAM_NAME,
    YC_THEME_OVERRIDE_COOKIE_NAME,
    YC_LANG_OVERRIDE_COOKIE_NAME,
    YC_OVERRIDE_COOKIE_VALUE_REG,
    DASH_API_BASE_URL,
    CHARTS_API_BASE_URL,
    YAV_API_BASE_URL,
    DASH_DEFAULT_NAMESPACE,
    DASH_ENTRY_RELEVANT_FIELDS,
    BASE_PROJECT_NAME,
    BLOCK_STAT,
    WORLD_REGION,
    SERVICE_NAME_DATALENS,
    selectServerPalette,
};
