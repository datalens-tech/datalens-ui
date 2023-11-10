import {DATASET_FIELD_TYPES, IChartEditor} from '../../../../../../../../../shared';

const DATASET_ID = 'j43msj9o23ge9';

export const COLOR_FIELD_DIMENSION = {
    type: 'DIMENSION',
    datasetId: DATASET_ID,
    title: 'ColorField',
    guid: 'cddd9cad-52a2-4232-8898-ade9a972c864',
    data_type: DATASET_FIELD_TYPES.STRING,
};

export const COLOR_FIELD_MEASURE_NUMBER = {
    type: 'MEASURE',
    datasetId: DATASET_ID,
    title: 'ColorField',
    guid: 'cddd9cad-52a2-4232-8898-ade9a972c864',
    data_type: DATASET_FIELD_TYPES.INTEGER,
};

export const COLOR_FIELD_MEASURE_TEXT = {
    type: 'MEASURE',
    datasetId: DATASET_ID,
    title: 'ColorField',
    guid: 'cddd9cad-52a2-4232-8898-ade9a972c864',
    data_type: DATASET_FIELD_TYPES.STRING,
};

export const MEASURE_FIELD = {
    type: 'MEASURE',
    datasetId: DATASET_ID,
    title: 'MeasureField',
    guid: 'a6b94410-e219-11e9-a279-0b30c0a74ab7',
    data_type: DATASET_FIELD_TYPES.INTEGER,
};

export const SET_WITH_DIMENSION_AND_MEASURE = {
    placeholders: [
        {
            id: 'dimensions',
            items: [COLOR_FIELD_DIMENSION],
        },
        {
            id: 'measures',
            items: [MEASURE_FIELD],
        },
    ],
    colors: [COLOR_FIELD_DIMENSION],
    resultData: {
        data: [
            ['1', '1'],
            ['2', '2'],
        ],
        order: [COLOR_FIELD_DIMENSION, MEASURE_FIELD],
        totals: [],
    },
    colorsConfig: {
        colors: [
            '#4DA2F1',
            '#FF3D64',
            '#8AD554',
            '#FFC636',
            '#FFB9DD',
            '#84D1EE',
            '#FF91A1',
            '#54A520',
            '#DB9100',
            '#BA74B3',
            '#1F68A9',
            '#ED65A9',
            '#0FA08D',
            '#FF7E00',
            '#E8B0A4',
            '#52A6C5',
            '#BE2443',
            '#70C1AF',
            '#FFB46C',
            '#DCA3D7',
        ],
        gradientColors: ['#0044A3', '#8CCBFF'],
        loadedColorPalettes: {},
    },
};

export const SET_WITH_MEASURE_NUMBER_AND_MEASURE = {
    placeholders: [
        {
            id: 'dimensions',
            items: [COLOR_FIELD_MEASURE_NUMBER],
        },
        {
            id: 'measures',
            items: [MEASURE_FIELD],
        },
    ],
    colors: [COLOR_FIELD_MEASURE_NUMBER],
    resultData: {
        data: [
            ['1', '1'],
            ['2', '2'],
        ],
        order: [COLOR_FIELD_MEASURE_NUMBER, MEASURE_FIELD],
        totals: [],
    },
    colorsConfig: {
        gradientMode: '2-point',
        gradientPalette: 'violet',
        polygonBorders: 'show',
        reversed: false,
        colors: [
            '#4DA2F1',
            '#FF3D64',
            '#8AD554',
            '#FFC636',
            '#FFB9DD',
            '#84D1EE',
            '#FF91A1',
            '#54A520',
            '#DB9100',
            '#BA74B3',
            '#1F68A9',
            '#ED65A9',
            '#0FA08D',
            '#FF7E00',
            '#E8B0A4',
            '#52A6C5',
            '#BE2443',
            '#70C1AF',
            '#FFB46C',
            '#DCA3D7',
        ],
        gradientColors: ['#6B32C9', '#D0A3FF'],
        loadedColorPalettes: {},
    },
};

export const SET_WITH_MEASURE_TEXT_AND_MEASURE = {
    placeholders: [
        {
            id: 'dimensions',
            items: [COLOR_FIELD_MEASURE_TEXT],
        },
        {
            id: 'measures',
            items: [MEASURE_FIELD],
        },
    ],
    colors: [COLOR_FIELD_MEASURE_TEXT],
    resultData: {
        data: [
            ['1', '1'],
            ['2', '2'],
        ],
        order: [COLOR_FIELD_MEASURE_TEXT, MEASURE_FIELD],
        totals: [],
    },
    colorsConfig: {
        colors: [
            '#4DA2F1',
            '#FF3D64',
            '#8AD554',
            '#FFC636',
            '#FFB9DD',
            '#84D1EE',
            '#FF91A1',
            '#54A520',
            '#DB9100',
            '#BA74B3',
            '#1F68A9',
            '#ED65A9',
            '#0FA08D',
            '#FF7E00',
            '#E8B0A4',
            '#52A6C5',
            '#BE2443',
            '#70C1AF',
            '#FFB46C',
            '#DCA3D7',
        ],
        gradientColors: ['#0044A3', '#8CCBFF'],
        loadedColorPalettes: {},
    },
};

export const PREPARE_FUNCTION_ARGS = {
    ChartEditor: {
        getWidgetConfig: () => {},
    } as IChartEditor,
    datasets: [],
    fields: [],
    shapes: [],
    visualizationId: 'pie',
    idToDataType: {
        [COLOR_FIELD_DIMENSION.guid]: COLOR_FIELD_DIMENSION.data_type,
        [COLOR_FIELD_MEASURE_NUMBER.guid]: COLOR_FIELD_MEASURE_NUMBER.data_type,
        [COLOR_FIELD_MEASURE_TEXT.guid]: COLOR_FIELD_MEASURE_TEXT.data_type,
        [MEASURE_FIELD.guid]: MEASURE_FIELD.data_type,
    },
    idToTitle: {
        [COLOR_FIELD_DIMENSION.guid]: COLOR_FIELD_DIMENSION.title,
        [COLOR_FIELD_MEASURE_NUMBER.guid]: COLOR_FIELD_MEASURE_NUMBER.title,
        [COLOR_FIELD_MEASURE_TEXT.guid]: COLOR_FIELD_MEASURE_TEXT.title,
        [MEASURE_FIELD.guid]: MEASURE_FIELD.title,
    },
    ...SET_WITH_DIMENSION_AND_MEASURE,
};
