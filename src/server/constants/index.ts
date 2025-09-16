import type {ColorPalette, Palette} from '../../shared';

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
export const selectServerPalette = (args: {
    palette?: string;
    availablePalettes: Record<string, Palette>;
    customColorPalettes?: Record<string, ColorPalette>;
    defaultColorPaletteId: string;
}) => {
    const {
        defaultColorPaletteId,
        palette: selectedPalleteId,
        availablePalettes,
        customColorPalettes,
    } = args;

    if (selectedPalleteId) {
        if (customColorPalettes?.[selectedPalleteId]) {
            return customColorPalettes[selectedPalleteId].colors;
        }

        if (availablePalettes?.[selectedPalleteId]) {
            return availablePalettes[selectedPalleteId].scheme;
        }
    }

    if (customColorPalettes?.[defaultColorPaletteId]) {
        return customColorPalettes[defaultColorPaletteId].colors;
    }

    return availablePalettes[defaultColorPaletteId]?.scheme ?? [];
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
};
