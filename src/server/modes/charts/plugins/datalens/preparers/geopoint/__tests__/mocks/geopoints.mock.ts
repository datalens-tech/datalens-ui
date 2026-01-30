import type {ServerColor} from '../../../../../../../../../shared';
import {DATASET_FIELD_TYPES} from '../../../../../../../../../shared';

const DATASET_ID = 'j43msj9o23ge9';

export const COORDINATES_FIELD = {
    datasetId: DATASET_ID,
    title: 'CoordinatesField',
    guid: 'cddd9cad-52a2-4232-8898-ade9a972c864',
    data_type: DATASET_FIELD_TYPES.GEOPOINT,
};

export const DIMENSION_COLOR_FIELD = {
    datasetId: DATASET_ID,
    title: 'ColorField',
    guid: '38e0b1f4-d46b-48a0-8905-6a6d1e61900d',
    data_type: DATASET_FIELD_TYPES.STRING,
    type: 'DIMENSION',
} as ServerColor;

export const MEASURE_COLOR_FIELD = {
    datasetId: DATASET_ID,
    title: 'ColorField',
    guid: '38e0b1f4-d46b-48a0-8905-6a6d1e61900d',
    data_type: DATASET_FIELD_TYPES.STRING,
    type: 'MEASURE',
} as ServerColor;

export const PREPARE_FUNCTION_ARGS = {
    colors: [],
    colorsConfig: {
        loadedColorPalettes: {},
        colors: ['defaultColor', 'blue', 'red', 'orange'],
        gradientColors: [],
        availablePalettes: {
            custom: {id: 'custom', scheme: ['defaultColor', 'blue', 'red', 'orange']},
        },
        palette: 'custom',
    },
    labels: [],
    tooltips: [],
    shared: {},
    placeholders: [
        {
            id: 'geopoint',
            items: [COORDINATES_FIELD],
        },
        {
            id: 'size',
            items: [],
        },
    ],
    idToTitle: {
        [COORDINATES_FIELD.guid]: COORDINATES_FIELD.title,
        [DIMENSION_COLOR_FIELD.guid]: DIMENSION_COLOR_FIELD.title,
        [MEASURE_COLOR_FIELD.guid]: MEASURE_COLOR_FIELD.title,
    },
    idToDataType: {
        [COORDINATES_FIELD.guid]: DATASET_FIELD_TYPES.GEOPOINT,
        [DIMENSION_COLOR_FIELD.guid]: DATASET_FIELD_TYPES.STRING,
        [MEASURE_COLOR_FIELD.guid]: DATASET_FIELD_TYPES.STRING,
    },
    resultData: {
        data: [],
        order: [],
        totals: [],
    },
    ChartEditor: {
        getTranslation: (key: string) => key,
        getWidgetConfig: () => ({}),
        updateHighchartsConfig: () => {},
    },
    features: [],
};
