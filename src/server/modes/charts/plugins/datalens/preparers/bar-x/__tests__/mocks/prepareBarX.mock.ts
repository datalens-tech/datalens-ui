import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import type {
    IChartEditor,
    ServerColor,
    ServerField,
    ServerShape,
} from '../../../../../../../../../shared';
import {DATASET_FIELD_TYPES} from '../../../../../../../../../shared';
import type {PrepareFunctionArgs} from '../../../types';

const ChartEditor = {
    getWidgetConfig: () => {},
} as IChartEditor;

const datasetId = 'someDatasetId';

export const x1Field = {
    datasetId,
    title: 'X1Field',
    guid: 'guidX1',
    data_type: DATASET_FIELD_TYPES.DATE,
} as ServerField;

export const x2Field = {
    datasetId,
    title: 'X2Field',
    guid: 'guidX2',
    data_type: DATASET_FIELD_TYPES.STRING,
} as ServerField;

export const yField = {
    datasetId,
    title: 'YField',
    guid: 'a6b94410-e219-11e9-a279-0b30c0a74ab7',
    data_type: DATASET_FIELD_TYPES.FLOAT,
} as ServerField;

export const colorField = {
    datasetId,
    title: 'ColorField',
    guid: '38e0b1f4-d46b-48a0-8905-6a6d1e61900d',
    data_type: DATASET_FIELD_TYPES.STRING,
} as ServerColor;

export const shapeField = {
    datasetId,
    title: 'ShapeField',
    guid: '45bdfbb6-1dd9-41bd-9871-b011efd8ec6b',
    data_type: DATASET_FIELD_TYPES.STRING,
} as ServerShape;

export const prepareBarXArgs = {
    ChartEditor,
    colors: [],
    colorsConfig: {loadedColorPalettes: {}, colors: ['blue', 'red', 'orange'], gradientColors: []},
    datasets: [],
    fields: [],
    shapes: [],
    sort: [],
    segments: [],
    visualizationId: 'column',
    shared: {
        visualization: {id: 'column'},
    },
    idToDataType: {
        [x1Field.guid]: x1Field.data_type,
        [x2Field.guid]: x2Field.data_type,
        [yField.guid]: yField.data_type,
        [colorField.guid]: colorField.data_type,
        [shapeField.guid]: shapeField.data_type,
    } as Record<string, DATASET_FIELD_TYPES>,
    idToTitle: {
        [x1Field.guid]: x1Field.title,
        [x2Field.guid]: x2Field.title,
        [yField.guid]: yField.title,
        [colorField.guid]: colorField.title,
        [shapeField.guid]: shapeField.title,
    },
    placeholders: [
        {
            id: 'x',
            items: [x1Field],
        },
        {
            id: 'y',
            items: [yField],
        },
    ],
    resultData: {
        data: [],
        order: [x1Field, yField],
        totals: [],
    },
    features: {},
};

const monthField = {
    datasetId,
    title: 'Month',
    guid: 'e83fb454-ca9a-4083-95be-1994e9957655',
    data_type: DATASET_FIELD_TYPES.INTEGER,
} as ServerField;

const profitField = {
    datasetId,
    title: 'Profit',
    guid: '4b6463d1-30e1-425e-b7d2-77205bc75de6',
    data_type: DATASET_FIELD_TYPES.INTEGER,
} as ServerField;

const measureValuesField = {
    title: 'Measure Values',
    type: 'PSEUDO',
    className: 'item pseudo-item measure-item',
    data_type: 'float',
    id: 'inserted-1705501045437',
};

export const prepareBarXWithMeasureValuesArgs = {
    ChartEditor,
    placeholders: [
        {
            id: 'x',
            items: [monthField],
        },
        {
            id: 'y',
            items: [profitField],
        },
    ],
    colors: [measureValuesField],
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
    geopointsConfig: {},
    sort: [],
    visualizationId: 'column',
    labels: [],
    tooltips: [],
    datasets: [datasetId],
    resultData: {
        data: [
            ['1', '8970'],
            ['2', '10166'],
            ['3', '28277'],
        ],
        legend: [
            [0, 1],
            [0, 1],
            [0, 1],
        ],
        order: [
            {datasetId, title: monthField.title, dataType: monthField.data_type},
            {datasetId, title: profitField.title, dataType: profitField.data_type},
        ],
        totals: [],
    },
    fields: [monthField, profitField],
    idToTitle: {
        [monthField.guid]: monthField.title,
        [profitField.guid]: profitField.title,
    },
    idToDataType: {
        [monthField.guid]: monthField.data_type,
        [profitField.guid]: profitField.data_type,
    },
    shared: {visualization: {id: 'column'}},
    shapes: [],
    segments: [],
    features: {},
} as unknown as PrepareFunctionArgs;

export const prepareBarXWithMeasureValuesResult = {
    graphs: [
        {
            id: 'Profit',
            title: 'Profit',
            tooltip: {chartKitFormatting: true, chartKitPrecision: 0},
            data: [
                {
                    x: 1,
                    y: 8970,
                    colorValue: 8970,
                    dataLabels: {enabled: false},
                    label: '',
                },
                {
                    x: 2,
                    y: 10166,
                    colorValue: 10166,
                    dataLabels: {enabled: false},
                    label: '',
                },
                {
                    x: 3,
                    y: 28277,
                    colorValue: 28277,
                    dataLabels: {enabled: false},
                    label: '',
                },
            ],
            legendTitle: 'Profit',
            drillDownFilterValue: 'Profit',
            colorKey: 'colorValue',
            colorGuid: null,
            connectNulls: false,
            measureFieldTitle: 'Profit',
            yAxis: 0,
            custom: {},
            color: '#4DA2F1',
        },
    ],
};

export function getPrepareFunctionArgs(options: Partial<PrepareFunctionArgs> = {}) {
    return merge(cloneDeep(prepareBarXArgs), options) as unknown as PrepareFunctionArgs;
}
