import type {ColorPalette, Palette} from '../../shared';
import {selectPaletteById} from '../../shared';

const DASH_API_BASE_URL = '/api/dash/v1/dashboards';
const CHARTS_API_BASE_URL = '/api/charts/v1/charts';

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
    'annotation',

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

// if the palette is not specified or not found, it returns the default palette
const selectServerPalette = (args: {
    palette?: string;
    availablePalettes: Record<string, Palette>;
    customColorPalettes?: Record<string, ColorPalette>;
}) => {
    const {palette, availablePalettes, customColorPalettes} = args;
    if (palette && customColorPalettes?.[palette]) {
        return customColorPalettes[palette].colors;
    }

    return selectPaletteById(palette, availablePalettes);
};

const SERVICE_NAME_DATALENS = 'DataLens';

export {
    DASH_API_BASE_URL,
    CHARTS_API_BASE_URL,
    DASH_DEFAULT_NAMESPACE,
    DASH_ENTRY_RELEVANT_FIELDS,
    BASE_PROJECT_NAME,
    BLOCK_STAT,
    WORLD_REGION,
    SERVICE_NAME_DATALENS,
    selectServerPalette,
};
