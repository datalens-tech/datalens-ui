import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import {DATASET_FIELD_TYPES, IChartEditor} from '../../../../../../../../../shared';
import {PrepareFunctionArgs} from '../../../types';

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
    guid: 'cddd9cad-52a2-4232-8898-ade9a972c864',
    data_type: DATASET_FIELD_TYPES.STRING,
};

export const colorFieldMeasureNumber = {
    type: 'MEASURE',
    datasetId: datasetId,
    title: 'ColorField',
    guid: 'cddd9cad-52a2-4232-8898-ade9a972c864',
    data_type: DATASET_FIELD_TYPES.INTEGER,
};

export const colorFieldMeasureString = {
    type: 'MEASURE',
    datasetId: datasetId,
    title: 'ColorField',
    guid: 'cddd9cad-52a2-4232-8898-ade9a972c864',
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
            id: 'dimensions',
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

export const measureNumberAndMeasure = {
    placeholders: [
        {
            id: 'dimensions',
            items: [colorFieldMeasureNumber],
        },
        {
            id: 'measures',
            items: [measureField],
        },
    ],
    colors: [colorFieldMeasureNumber],
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

export const measureTextAndMeasure = {
    placeholders: [
        {
            id: 'dimensions',
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
        [colorFieldMeasureNumber.guid]: colorFieldMeasureNumber.data_type,
        [colorFieldMeasureString.guid]: colorFieldMeasureString.data_type,
        [measureField.guid]: measureField.data_type,
    },
    idToTitle: {
        [colorFieldDimension.guid]: colorFieldDimension.title,
        [colorFieldMeasureNumber.guid]: colorFieldMeasureNumber.title,
        [colorFieldMeasureString.guid]: colorFieldMeasureString.title,
        [measureField.guid]: measureField.title,
    },
    ...piePrepareBaseArgs,
};

export const piePrepareForQLArgs = {
    placeholders: [
        {
            allowedTypes: {},
            allowedDataTypes: {},
            id: 'dimensions',
            type: 'dimensions',
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
};

export const piePrepareForQLResult = {
    graphs: [
        {
            name: 'iznos',
            tooltip: {chartKitFormatting: true, chartKitPrecision: 2},
            dataLabels: {chartKitFormatting: true, chartKitPrecision: 0},
            data: [
                {
                    name: 'Кирпич',
                    formattedName: '',
                    drillDownFilterValue: 'Кирпич',
                    y: 78,
                    colorGuid: 'wall_material-1',
                    colorValue: 'Кирпич',
                    color: '#4DA2F1',
                },
                {
                    name: 'Не заполнено',
                    formattedName: '',
                    drillDownFilterValue: 'Не заполнено',
                    y: 72,
                    colorGuid: 'wall_material-1',
                    colorValue: 'Не заполнено',
                    color: '#FF3D64',
                },
                {
                    name: 'Смешанные',
                    formattedName: '',
                    drillDownFilterValue: 'Смешанные',
                    y: 70,
                    colorGuid: 'wall_material-1',
                    colorValue: 'Смешанные',
                    color: '#8AD554',
                },
                {
                    name: 'Деревянные',
                    formattedName: '',
                    drillDownFilterValue: 'Деревянные',
                    y: 67,
                    colorGuid: 'wall_material-1',
                    colorValue: 'Деревянные',
                    color: '#FFC636',
                },
            ],
        },
    ],
    categories: ['Не заполнено', 'Смешанные', 'Деревянные', 'Кирпич'],
};

export function getPrepareFunctionArgs(options: Partial<PrepareFunctionArgs> = {}) {
    return merge(cloneDeep(piePrepareArgs), options) as unknown as PrepareFunctionArgs;
}
