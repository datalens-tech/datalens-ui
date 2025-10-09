import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import type {IChartEditor} from '../../../../../../../../../shared';
import {COMMON_PALETTE_ID, DATASET_FIELD_TYPES} from '../../../../../../../../../shared';
import classic20 from '../../../../../../../../../shared/constants/colors/common/classic-20';
import {EmptyPrepapreArgs} from '../../../__tests__/common.mock';
import type {PrepareFunctionArgs} from '../../../types';

const chartEditorMock = {
    getLang: () => {
        return 'en';
    },
    updateHighchartsConfig: () => {},
    updateConfig: () => {},
    getWidgetConfig: () => {},
};

const datasetId = 'j43msj9o23ge9';

export const colorFieldDimension = {
    type: 'DIMENSION',
    datasetId: datasetId,
    title: 'ColorField',
    guid: 'colorFieldDimension_guid',
    data_type: DATASET_FIELD_TYPES.STRING,
};

export const colorFieldDimensionFloat = {
    type: 'DIMENSION',
    datasetId: datasetId,
    title: 'ColorField',
    guid: 'colorFieldDimensionFloat_guid',
    data_type: DATASET_FIELD_TYPES.FLOAT,
};

export const colorFieldMeasureNumber = {
    type: 'MEASURE',
    datasetId: datasetId,
    title: 'ColorField',
    guid: 'colorFieldMeasureNumber_guid',
    data_type: DATASET_FIELD_TYPES.INTEGER,
};

export const colorFieldMeasureString = {
    type: 'MEASURE',
    datasetId: datasetId,
    title: 'ColorField',
    guid: 'colorFieldMeasureString_guid',
    data_type: DATASET_FIELD_TYPES.STRING,
};

export const measureField = {
    type: 'MEASURE',
    datasetId: datasetId,
    title: 'MeasureField',
    guid: 'a6b94410-e219-11e9-a279-0b30c0a74ab7',
    data_type: DATASET_FIELD_TYPES.INTEGER,
};

export const piePrepareBaseArgs = {
    placeholders: [
        {
            id: 'colors',
            items: [colorFieldDimension],
        },
        {
            id: 'measures',
            items: [measureField],
        },
    ],
    colors: [colorFieldDimension],
    resultData: {
        data: [
            ['1', '1'],
            ['2', '2'],
        ],
        order: [colorFieldDimension, measureField],
        totals: [],
    },
    colorsConfig: {
        availablePalettes: {[COMMON_PALETTE_ID.CLASSIC_20]: classic20},
        gradientColors: ['#0044A3', '#8CCBFF'],
        loadedColorPalettes: {},
    },
    features: {},
    defaultColorPaletteId: COMMON_PALETTE_ID.CLASSIC_20,
};

export const measureNumberAndMeasure = {
    placeholders: [
        {
            id: 'colors',
            items: [colorFieldMeasureNumber],
        },
        {
            id: 'measures',
            items: [measureField],
        },
    ],
    resultData: {
        data: [
            ['1', '1'],
            ['2', '2'],
        ],
        order: [colorFieldMeasureNumber, measureField],
        totals: [],
    },
    colorsConfig: {
        gradientMode: '2-point',
        gradientPalette: 'violet',
        polygonBorders: 'show',
        reversed: false,
        availablePalettes: {[COMMON_PALETTE_ID.CLASSIC_20]: classic20},
        gradientColors: ['#6B32C9', '#D0A3FF'],
        loadedColorPalettes: {},
    },
    defaultColorPaletteId: COMMON_PALETTE_ID.CLASSIC_20,
};

export const measureTextAndMeasure = {
    placeholders: [
        {
            id: 'colors',
            items: [colorFieldMeasureString],
        },
        {
            id: 'measures',
            items: [measureField],
        },
    ],
    colors: [colorFieldMeasureString],
    resultData: {
        data: [
            ['1', '1'],
            ['2', '2'],
        ],
        order: [colorFieldMeasureString, measureField],
        totals: [],
    },
    colorsConfig: {
        availablePalettes: {[COMMON_PALETTE_ID.CLASSIC_20]: classic20},
        gradientColors: ['#0044A3', '#8CCBFF'],
        loadedColorPalettes: {},
    },
    defaultColorPaletteId: COMMON_PALETTE_ID.CLASSIC_20,
};

export const piePrepareArgs = {
    ChartEditor: {
        getWidgetConfig: () => {},
    } as IChartEditor,
    datasets: [],
    fields: [],
    shapes: [],
    visualizationId: 'pie',
    shared: {
        type: 'datalens',
    },
    idToDataType: {
        [colorFieldDimension.guid]: colorFieldDimension.data_type,
        [colorFieldDimensionFloat.guid]: colorFieldDimensionFloat.data_type,
        [colorFieldMeasureNumber.guid]: colorFieldMeasureNumber.data_type,
        [colorFieldMeasureString.guid]: colorFieldMeasureString.data_type,
        [measureField.guid]: measureField.data_type,
    },
    idToTitle: {
        [colorFieldDimension.guid]: colorFieldDimension.title,
        [colorFieldDimensionFloat.guid]: colorFieldDimensionFloat.title,
        [colorFieldMeasureNumber.guid]: colorFieldMeasureNumber.title,
        [colorFieldMeasureString.guid]: colorFieldMeasureString.title,
        [measureField.guid]: measureField.title,
    },
    ...piePrepareBaseArgs,
};

export const piePrepareForQLArgs = {
    ...EmptyPrepapreArgs,
    placeholders: [
        {
            allowedTypes: {},
            allowedDataTypes: {},
            id: 'colors',
            type: 'colors',
            title: 'section_color',
            iconProps: {},
            items: [
                {
                    guid: 'wall_material-1',
                    title: 'wall_material',
                    datasetId: 'ql-mocked-dataset',
                    data_type: 'string',
                    cast: 'string',
                    type: 'DIMENSION',
                    calc_mode: 'direct',
                    inspectHidden: true,
                    formulaHidden: true,
                    noEdit: true,
                },
            ],
            required: true,
            capacity: 1,
        },
        {
            allowedTypes: {},
            allowedFinalTypes: {},
            allowedDataTypes: {},
            id: 'measures',
            type: 'measures',
            title: 'section_measures',
            iconProps: {},
            items: [
                {
                    guid: 'iznos-0',
                    title: 'iznos',
                    datasetId: 'ql-mocked-dataset',
                    data_type: 'float',
                    cast: 'float',
                    type: 'DIMENSION',
                    calc_mode: 'direct',
                    inspectHidden: true,
                    formulaHidden: true,
                    noEdit: true,
                },
            ],
            required: true,
            capacity: 1,
        },
    ],
    fields: [],
    colors: [],
    colorsConfig: {
        availablePalettes: {[COMMON_PALETTE_ID.CLASSIC_20]: classic20},
        gradientColors: ['#0044A3', '#8CCBFF'],
        loadedColorPalettes: {},
    },
    sort: [],
    visualizationId: 'pie',
    labels: [],
    tooltips: [],
    datasets: [],
    resultData: {
        data: [
            ['Не заполнено', 67],
            ['Не заполнено', 100],
            ['Смешанные', 70],
            ['Деревянные', 40],
            ['Не заполнено', null],
            ['Не заполнено', null],
            ['Не заполнено', null],
            ['Кирпич', 78],
            ['Деревянные', 67],
            ['Не заполнено', 72],
        ],
        order: [
            {datasetId: 'ql-mocked-dataset', title: 'wall_material'},
            {datasetId: 'ql-mocked-dataset', title: 'iznos'},
            {datasetId: 'ql-mocked-dataset', title: 'Column Names'},
        ],
        totals: [],
    },
    idToTitle: {'wall_material-1': 'wall_material', 'iznos-0': 'iznos', '': 'Column Names'},
    idToDataType: {'wall_material-1': 'string', 'iznos-0': 'float', '': 'string'},
    shared: {
        sharedData: {},
    },
    ChartEditor: chartEditorMock,
    shapes: [],
    shapesConfig: {},
    segments: [],
    disableDefaultSorting: false,
    defaultColorPaletteId: COMMON_PALETTE_ID.CLASSIC_20,
};

export const piePrepareForQLResult = {
    graphs: [
        {
            name: 'iznos',
            pointConflict: true,
            tooltip: {chartKitFormatting: true, chartKitPrecision: 2},
            dataLabels: {chartKitFormatting: true, chartKitPrecision: 0, useHTML: false},
            data: [
                {
                    name: 'Кирпич',
                    formattedName: 'Кирпич',
                    drillDownFilterValue: 'Кирпич',
                    y: 78,
                    colorGuid: 'wall_material-1',
                    colorValue: 'Кирпич',
                    color: '#4DA2F1',
                },
                {
                    name: 'Не заполнено',
                    formattedName: 'Не заполнено',
                    drillDownFilterValue: 'Не заполнено',
                    y: 72,
                    colorGuid: 'wall_material-1',
                    colorValue: 'Не заполнено',
                    color: '#FF3D64',
                },
                {
                    name: 'Смешанные',
                    formattedName: 'Смешанные',
                    drillDownFilterValue: 'Смешанные',
                    y: 70,
                    colorGuid: 'wall_material-1',
                    colorValue: 'Смешанные',
                    color: '#8AD554',
                },
                {
                    name: 'Деревянные',
                    formattedName: 'Деревянные',
                    drillDownFilterValue: 'Деревянные',
                    y: 67,
                    colorGuid: 'wall_material-1',
                    colorValue: 'Деревянные',
                    color: '#FFC636',
                },
            ],
        },
    ],
};

export function getPrepareFunctionArgs(options: Partial<PrepareFunctionArgs> = {}) {
    return merge(cloneDeep(piePrepareArgs), options) as unknown as PrepareFunctionArgs;
}
