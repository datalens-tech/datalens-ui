import {dateTime} from '@gravity-ui/date-utils';

import {AxisMode} from '../../../../../../../../../shared';

export const expectedResult = {
    timeline: [
        dateTime({input: '2023-03-01T00:00:00', timeZone: 'UTC'}).valueOf() / 1000,
        dateTime({input: '2023-03-02T00:00:00', timeZone: 'UTC'}).valueOf() / 1000,
    ],
    timeZone: 'UTC',
    graphs: [
        {
            id: 'Query #0',
            colorGuid: 'query #-2',
            colorValue: 'Query #0',
            name: 'Query #0',
            color: 'rgb(0,127,0)',
            data: [1, 1],
            spanGaps: false,
        },
        {
            id: 'Query #1',
            colorGuid: 'query #-2',
            colorValue: 'Query #1',
            name: 'Query #1',
            color: 'rgb(255,255,0)',
            data: [2, 2],
            spanGaps: false,
        },
        {
            id: 'Query #2',
            colorGuid: 'query #-2',
            colorValue: 'Query #2',
            name: 'Query #2',
            color: 'rgb(255,0,0)',
            data: [3, 3],
            spanGaps: false,
        },
        {
            id: 'Query #3',
            colorGuid: 'query #-2',
            colorValue: 'Query #3',
            name: 'Query #3',
            color: 'rgb(191,0,127)',
            data: [4, 4],
            spanGaps: false,
        },
    ],
    axes: [{scale: 'x', plotLines: [{width: 3, color: '#ffa0a0'}]}],
};

export const options = {
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
                    guid: 'timestamp-0',
                    title: 'timestamp',
                    datasetId: 'ql-mocked-dataset',
                    data_type: 'genericdatetime',
                    cast: 'genericdatetime',
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
                axisModeMap: {},
                axisMode: AxisMode.Continuous,
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
                    guid: 'value-1',
                    title: 'value',
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
                nulls: 'as-0',
                axisFormatMode: 'auto',
                axisModeMap: {},
            },
        },
    ],
    fields: [],
    colors: [
        {
            guid: 'query #-2',
            title: 'query #',
            datasetId: 'ql-mocked-dataset',
            data_type: 'string',
            cast: 'string',
            type: 'DIMENSION',
            calc_mode: 'direct',
            inspectHidden: true,
            formulaHidden: true,
            noEdit: true,
            id: 'inserted-1682600847435',
        },
    ],
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
    visualizationId: 'area',
    labels: [
        {
            guid: 'attribute-6',
            title: 'attribute',
            datasetId: 'ql-mocked-dataset',
            data_type: 'string',
            cast: 'string',
            type: 'DIMENSION',
            calc_mode: 'direct',
            inspectHidden: true,
            formulaHidden: true,
            noEdit: true,
            id: 'inserted-1680034721946',
            mode: 'absolute',
        },
    ],
    tooltips: [],
    datasets: [],
    resultData: {
        data: [
            ['2023-03-01T00:00:00', 1, 'Query #0'],
            ['2023-03-02T00:00:00', 1, 'Query #0'],
            ['2023-03-01T00:00:00', 2, 'Query #1'],
            ['2023-03-02T00:00:00', 2, 'Query #1'],
            ['2023-03-01T00:00:00', 3, 'Query #2'],
            ['2023-03-02T00:00:00', 3, 'Query #2'],
            ['2023-03-01T00:00:00', 4, 'Query #3'],
            ['2023-03-02T00:00:00', 4, 'Query #3'],
        ],
        order: [
            {datasetId: 'ql-mocked-dataset', title: 'timestamp'},
            {datasetId: 'ql-mocked-dataset', title: 'value'},
            {datasetId: 'ql-mocked-dataset', title: 'query #'},
            {datasetId: 'ql-mocked-dataset', title: 'Column Names'},
        ],
        totals: [],
    },
    idToTitle: {
        'timestamp-0': 'timestamp',
        'value-1': 'value',
        'query #-2': 'query #',
        '': 'Column Names',
    },
    idToDataType: {
        'timestamp-0': 'genericdatetime',
        'value-1': 'float',
        'query #-2': 'string',
        '': 'string',
    },
    shared: {
        type: 'ql',
        chartType: 'monitoringql',
        connection: {entryId: 'sko8xq9yb2yck', type: 'solomon'},
        colors: [
            {
                guid: 'query #-2',
                title: 'query #',
                datasetId: 'ql-mocked-dataset',
                data_type: 'string',
                cast: 'string',
                type: 'DIMENSION',
                calc_mode: 'direct',
                inspectHidden: true,
                formulaHidden: true,
                noEdit: true,
                id: 'inserted-1682600847435',
            },
        ],
        colorsConfig: {},
        labels: [
            {
                guid: 'attribute-6',
                title: 'attribute',
                datasetId: 'ql-mocked-dataset',
                data_type: 'string',
                cast: 'string',
                type: 'DIMENSION',
                calc_mode: 'direct',
                inspectHidden: true,
                formulaHidden: true,
                noEdit: true,
                id: 'inserted-1680034721946',
                mode: 'absolute',
            },
        ],
        tooltips: [],
        extraSettings: {},
        queryValue: '',
        queries: [
            {
                value: 'constant_line(1)',
                params: [{name: 'project_id', type: 'string', defaultValue: 'reactor'}],
                hidden: false,
            },
            {
                value: 'constant_line(2)',
                params: [{name: 'project_id', type: 'string', defaultValue: 'reactor'}],
                hidden: false,
            },
            {
                value: 'constant_line(3)',
                params: [{name: 'project_id', type: 'string', defaultValue: 'reactor'}],
                hidden: false,
            },
            {
                value: 'constant_line(4)',
                params: [{name: 'project_id', type: 'string', defaultValue: 'reactor'}],
                hidden: false,
            },
        ],
        params: [
            {type: 'datetime', name: 'from', defaultValue: '2023-03-01T00:00:00.000+00:00'},
            {type: 'datetime', name: 'to', defaultValue: '2023-03-02T00:00:00.000+00:00'},
        ],
        visualization: {
            id: 'area',
            type: 'line',
            name: 'label_visualization-area',
            iconProps: {width: '24'},
            allowFilters: false,
            allowColors: true,
            allowSort: false,
            allowSegments: false,
            allowLabels: true,
            availableLabelModes: ['absolute'],
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
                            guid: 'timestamp-0',
                            title: 'timestamp',
                            datasetId: 'ql-mocked-dataset',
                            data_type: 'genericdatetime',
                            cast: 'genericdatetime',
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
                        axisModeMap: {},
                        axisMode: AxisMode.Continuous,
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
                            guid: 'value-1',
                            title: 'value',
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
                        nulls: 'as-0',
                        axisFormatMode: 'auto',
                        axisModeMap: {},
                    },
                },
            ],
            allowShapes: false,
            allowAvailable: true,
        },
        order: [],
        preview: true,
        available: [
            {
                guid: 'timestamp-0',
                title: 'timestamp',
                datasetId: 'ql-mocked-dataset',
                data_type: 'genericdatetime',
                cast: 'genericdatetime',
                type: 'DIMENSION',
                calc_mode: 'direct',
                inspectHidden: true,
                formulaHidden: true,
                noEdit: true,
            },
            {
                guid: 'value-1',
                title: 'value',
                datasetId: 'ql-mocked-dataset',
                data_type: 'float',
                cast: 'float',
                type: 'DIMENSION',
                calc_mode: 'direct',
                inspectHidden: true,
                formulaHidden: true,
                noEdit: true,
            },
            {
                guid: 'query #-2',
                title: 'query #',
                datasetId: 'ql-mocked-dataset',
                data_type: 'string',
                cast: 'string',
                type: 'DIMENSION',
                calc_mode: 'direct',
                inspectHidden: true,
                formulaHidden: true,
                noEdit: true,
            },
            {
                title: 'Column Names',
                type: 'PSEUDO',
                data_type: 'string',
                inspectHidden: true,
                formulaHidden: true,
                noEdit: true,
                guid: '',
                datasetId: '',
                cast: 'string',
                calc_mode: 'direct',
            },
        ],
        sort: [],
        sharedData: {},
    },
    ChartEditor: {
        updateLibraryConfig: () => {},
    },
    shapes: [],
    segments: [],
};
