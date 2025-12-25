import type {
    IChartEditor,
    ServerColor,
    ServerField,
    ServerShape,
} from '../../../../../../../../../shared';
import {AxisMode, DATASET_FIELD_TYPES} from '../../../../../../../../../shared';

const chartEditorMock = {
    getLang: () => {
        return 'en';
    },
    updateHighchartsConfig: () => {},
    updateConfig: () => {},
    getWidgetConfig: () => {},
};

const datasetId = 'j43msj9o23ge9';

const xField = {
    datasetId: datasetId,
    title: 'XField',
    guid: 'cddd9cad-52a2-4232-8898-ade9a972c864',
    data_type: DATASET_FIELD_TYPES.GENERICDATETIME,
} as ServerField;

const yField = {
    datasetId: datasetId,
    title: 'YField',
    guid: 'a6b94410-e219-11e9-a279-0b30c0a74ab7',
    data_type: DATASET_FIELD_TYPES.FLOAT,
} as ServerField;

export const colorField = {
    datasetId: datasetId,
    title: 'ColorField',
    guid: '38e0b1f4-d46b-48a0-8905-6a6d1e61900d',
    data_type: DATASET_FIELD_TYPES.STRING,
} as ServerColor;

export const shapeField = {
    datasetId: datasetId,
    title: 'ShapeField',
    guid: '45bdfbb6-1dd9-41bd-9871-b011efd8ec6b',
    data_type: DATASET_FIELD_TYPES.STRING,
} as ServerShape;

export const scatterPrepareBaseArgs = {
    ChartEditor: {
        getWidgetConfig: () => {},
    } as IChartEditor,
    colors: [],
    colorsConfig: {
        loadedColorPalettes: {},
        colors: ['blue', 'red', 'orange'],
        availablePalettes: {custom: {id: 'custom', scheme: ['blue', 'red', 'orange']}},
        palette: 'custom',
        gradientColors: [],
    },
    datasets: [],
    fields: [],
    shapes: [],
    visualizationId: 'scatter',
    idToDataType: {
        [xField.guid]: xField.data_type,
        [yField.guid]: yField.data_type,
        [colorField.guid]: colorField.data_type,
        [shapeField.guid]: shapeField.data_type,
    } as Record<string, DATASET_FIELD_TYPES>,
    idToTitle: {
        [xField.guid]: xField.title,
        [yField.guid]: yField.title,
        [colorField.guid]: colorField.title,
        [shapeField.guid]: shapeField.title,
    },
    placeholders: [
        {
            id: 'x',
            items: [xField],
        },
        {
            id: 'y',
            items: [yField],
        },
        {
            id: 'points',
            items: [],
        },
        {
            id: 'size',
            items: [],
        },
    ],
    resultData: {
        data: [
            ['2023-05-11T00:00:00', '10', 'Shape-1', 'Color-1'],
            ['2023-05-12T00:00:00', '11', 'Shape-1', 'Color-2'],
            ['2023-05-13T00:00:00', '15', 'Shape-2', 'Color-1'],
            ['2023-05-14T00:00:00', '100', 'Shape-2', 'Color-2'],
        ],
        order: [xField, yField, shapeField, colorField],
        totals: [],
    },
    features: [],
    shared: {},
};

export const scatterPrepareForQLArgs = {
    placeholders: [
        {
            allowedTypes: {},
            allowedDataTypes: {},
            id: 'x',
            type: 'x',
            title: 'section_x',
            iconProps: {},
            items: [
                {
                    guid: 'built_year-0',
                    title: 'built_year',
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
            settings: {
                scale: 'auto',
                scaleValue: 'min-max',
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                holidays: 'off',
                axisFormatMode: 'auto',
                axisModeMap: {'built_year-0': AxisMode.Discrete},
            },
        },
        {
            allowedTypes: {},
            allowedFinalTypes: {},
            allowedDataTypes: {},
            id: 'y',
            type: 'y',
            title: 'section_y',
            iconProps: {},
            items: [
                {
                    guid: 'iznos-1',
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
            settings: {
                scale: 'auto',
                scaleValue: 'min-max',
                title: 'off',
                titleValue: '',
                type: 'linear',
                grid: 'on',
                gridStep: 'auto',
                gridStepValue: 50,
                hideLabels: 'no',
                labelsView: 'auto',
                axisFormatMode: 'auto',
            },
        },
        {
            allowedTypes: {},
            allowedDataTypes: {},
            id: 'points',
            type: 'points',
            title: 'section_points',
            iconProps: {},
            items: [],
            capacity: 1,
        },
        {
            allowedTypes: {},
            allowedFinalTypes: {},
            allowedDataTypes: {},
            id: 'size',
            type: 'measures',
            title: 'section_points_size',
            iconProps: {},
            items: [],
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
    visualizationId: 'scatter',
    labels: [],
    tooltips: [],
    datasets: [],
    resultData: {
        data: [
            [null, 67],
            ['1976', 100],
            ['1970', 70],
            [null, 40],
            [null, null],
            [null, null],
            [null, null],
            ['1950', 78],
        ],
        order: [
            {datasetId: 'ql-mocked-dataset', title: 'built_year'},
            {datasetId: 'ql-mocked-dataset', title: 'iznos'},
            {datasetId: 'ql-mocked-dataset', title: 'Column Names'},
        ],
        totals: [],
    },
    idToTitle: {'built_year-0': 'built_year', 'iznos-1': 'iznos', '': 'Column Names'},
    idToDataType: {'built_year-0': 'string', 'iznos-1': 'float', '': 'string'},
    shared: {},
    ChartEditor: chartEditorMock,
    shapes: [],
    shapesConfig: {},
    segments: [],
    disableDefaultSorting: false,
    features: [],
};

export const scatterPrepareForQLResult = {
    graphs: [
        {
            data: [
                {xLabel: '1976', yLabel: '100,00', x: 0, y: 100, marker: {}},
                {xLabel: '1970', yLabel: '70,00', x: 1, y: 70, marker: {}},
                {xLabel: '1950', yLabel: '78,00', x: 2, y: 78, marker: {}},
            ],
            color: '#4DA2F1',
            marker: {symbol: 'circle'},
            keys: ['y'],
            custom: {
                tooltipOptions: {
                    colorTitle: '',
                    pointTitle: '',
                    shapeTitle: '',
                    sizeTitle: '',
                    xTitle: 'built_year',
                    yTitle: 'iznos',
                },
            },
        },
    ],
    categories: ['1976', '1970', '1950'],
};
