const i18nMock = {
    I18n: {
        keyset: (_str: string) => {
            return function (key: string, params: Record<string, string | number>) {
                if (key === 'label_total-value') {
                    return `Total: ${params.value}`;
                }

                return `Total`;
            };
        },
    },
    I18N: {
        setLang: jest.fn(),
    },
};

const getTranslation = (keyset: string, key: string, params: Record<string, string | number>) =>
    i18nMock.I18n.keyset(keyset)(key, params);

const chartEditorMock = {
    getParam: () => null,
    getParams: () => ({}),
    getCurrentPage() {},
    getLang: () => 'en',
    getTranslation,
    getWidgetConfig: () => undefined,
};

const baseArgs = {
    features: {},
    colors: [],
    colorsConfig: {},
    ChartEditor: chartEditorMock,
    shared: {
        sharedData: {},
    },
};

export const flatTableFormattingIntPrecisionArgs = {
    ...baseArgs,
    idToDataType: {'fdddd3b0-5639-11eb-9c8e-41e84ec800f0': 'integer'},
    idToTitle: {'fdddd3b0-5639-11eb-9c8e-41e84ec800f0': 'Sales'},
    placeholders: [
        {
            items: [
                {
                    guid: 'fdddd3b0-5639-11eb-9c8e-41e84ec800f0',
                    data_type: 'integer',
                    title: 'Sales',
                    formatting: {
                        format: 'number',
                        postfix: '',
                        precision: 2,
                        prefix: '',
                        showRankDelimiter: false,
                        units: null,
                    },
                },
            ],
        },
    ],
    resultData: {
        data: [['2297241.5023116767']],
        order: [{title: 'Sales'}],
        totals: [],
    },
};

export const flatTableFormattingFloatPrecisionArgs = {
    ...baseArgs,
    idToDataType: {'fdddd3b0-5639-11eb-9c8e-41e84ec800f0': 'float'},
    idToTitle: {'fdddd3b0-5639-11eb-9c8e-41e84ec800f0': 'Sales'},
    placeholders: [
        {
            items: [
                {
                    guid: 'fdddd3b0-5639-11eb-9c8e-41e84ec800f0',
                    data_type: 'float',
                    title: 'Sales',
                    formatting: {
                        format: 'number',
                        postfix: '',
                        precision: 1,
                        prefix: '',
                        showRankDelimiter: false,
                        units: null,
                    },
                },
            ],
        },
    ],
    resultData: {
        data: [['2297241.5023116767']],
        order: [{title: 'Sales'}],
        totals: [],
    },
};

export const flatTablePrepareWithTotalsArgs = {
    ...baseArgs,
    placeholders: [
        {
            items: [
                {
                    title: 'Creation date',
                    data_type: 'datetime',
                    datasetId: 'eqw2uiu7yoe86',
                    guid: 'created_date_wo4m',
                },
                {
                    data_type: 'datetime',
                    datasetId: 'eqw2uiu7yoe86',
                    title: 'title-5e6c2e70-b65b-11ec-af88-4394e371e35d',
                    guid: '5e6c2e70-b65b-11ec-af88-4394e371e35d',
                },
                {
                    data_type: 'string',
                    datasetId: 'eqw2uiu7yoe86',
                    title: 'title-90d94500-b65b-11ec-af88-4394e371e35d',
                    guid: '90d94500-b65b-11ec-af88-4394e371e35d',
                },
                {
                    data_type: 'float',
                    datasetId: 'eqw2uiu7yoe86',
                    title: 'title-9cb5ebd0-b65b-11ec-af88-4394e371e35d',
                    guid: '9cb5ebd0-b65b-11ec-af88-4394e371e35d',
                },
                {
                    guid: '3fad4e10-c24f-11ec-b4e2-bf6f817dc38a',
                    data_type: 'float',
                    datasetId: 'eqw2uiu7yoe86',
                    title: 'title-3fad4e10-c24f-11ec-b4e2-bf6f817dc38a',
                },
                {
                    title: 'title-61c43c90-cd24-11ec-9505-b3c24ed01959',
                    guid: '61c43c90-cd24-11ec-9505-b3c24ed01959',
                    data_type: 'integer',
                    datasetId: 'eqw2uiu7yoe86',
                },
                {
                    guid: 'cd7888d0-cd27-11ec-b241-fd02653f897f',
                    title: 'title-cd7888d0-cd27-11ec-b241-fd02653f897f',
                    data_type: 'float',
                    datasetId: 'eqw2uiu7yoe86',
                },
            ],
        },
    ],
    datasets: ['eqw2uiu7yoe86'],
    resultData: {
        data: [
            [
                '2022-03-05T06:36:17',
                '2022-03-05T17:55:12',
                'KZT',
                '2550.0',
                '2276.785714285714',
                '22',
                '1.2941176470588236',
            ],
            [
                '2022-03-05T07:01:28',
                '2022-03-05T17:58:09',
                'KZT',
                '1950.0',
                '1741.0714285714284',
                '16',
                '1.2307692307692308',
            ],
        ],
        legend: [
            [0, 1, 2, 3, 4, 5, 6],
            [0, 1, 2, 3, 4, 5, 6],
        ],
        order: [
            {
                datasetId: 'eqw2uiu7yoe86',
                title: 'Creation date',
            },
            {
                datasetId: 'eqw2uiu7yoe86',
                title: 'title-5e6c2e70-b65b-11ec-af88-4394e371e35d',
            },
            {
                datasetId: 'eqw2uiu7yoe86',
                title: 'title-90d94500-b65b-11ec-af88-4394e371e35d',
            },
            {
                datasetId: 'eqw2uiu7yoe86',
                title: 'title-9cb5ebd0-b65b-11ec-af88-4394e371e35d',
            },
            {
                datasetId: 'eqw2uiu7yoe86',
                title: 'title-3fad4e10-c24f-11ec-b4e2-bf6f817dc38a',
            },
            {
                datasetId: 'eqw2uiu7yoe86',
                title: 'title-61c43c90-cd24-11ec-9505-b3c24ed01959',
            },
            {
                datasetId: 'eqw2uiu7yoe86',
                title: 'title-cd7888d0-cd27-11ec-b241-fd02653f897f',
            },
        ],
        totals: ['', '', '', '4500.0', '4017.8571428571427', '', ''],
    },
    fields: [
        {
            legend_item_id: 0,
        },
        {
            legend_item_id: 1,
        },
        {
            legend_item_id: 2,
        },
        {
            legend_item_id: 3,
        },
        {
            legend_item_id: 4,
        },
        {
            legend_item_id: 5,
        },
        {
            legend_item_id: 6,
        },
    ],
    idToTitle: {
        created_date_wo4m: 'Creation date',
        '5e6c2e70-b65b-11ec-af88-4394e371e35d': 'title-5e6c2e70-b65b-11ec-af88-4394e371e35d',
        '90d94500-b65b-11ec-af88-4394e371e35d': 'title-90d94500-b65b-11ec-af88-4394e371e35d',
        '9cb5ebd0-b65b-11ec-af88-4394e371e35d': 'title-9cb5ebd0-b65b-11ec-af88-4394e371e35d',
        '3fad4e10-c24f-11ec-b4e2-bf6f817dc38a': 'title-3fad4e10-c24f-11ec-b4e2-bf6f817dc38a',
        '61c43c90-cd24-11ec-9505-b3c24ed01959': 'title-61c43c90-cd24-11ec-9505-b3c24ed01959',
        'cd7888d0-cd27-11ec-b241-fd02653f897f': 'title-cd7888d0-cd27-11ec-b241-fd02653f897f',
    },
    idToDataType: {
        created_date_wo4m: 'datetime',
        '5e6c2e70-b65b-11ec-af88-4394e371e35d': 'datetime',
        '90d94500-b65b-11ec-af88-4394e371e35d': 'string',
        '9cb5ebd0-b65b-11ec-af88-4394e371e35d': 'float',
        '3fad4e10-c24f-11ec-b4e2-bf6f817dc38a': 'float',
        '61c43c90-cd24-11ec-9505-b3c24ed01959': 'integer',
        'cd7888d0-cd27-11ec-b241-fd02653f897f': 'float',
    },
};

export const flatTablePrepareForQLArgs = {
    ...baseArgs,
    placeholders: [
        {
            allowedTypes: {},
            id: 'flat-table-columns',
            type: 'flat-table-columns',
            title: 'section_columns',
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
            settings: {groupping: 'on'},
        },
    ],
    fields: [],
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
    visualizationId: 'flatTable',
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
    shapes: [],
    shapesConfig: {},
    segments: [],
    disableDefaultSorting: false,
};

export const flatTablePrepareForQLResult = {
    head: [
        {id: 'wall_material-1', name: 'wall_material', type: 'text'},
        {id: 'iznos-0', name: 'iznos', type: 'number', formatter: {}, view: 'number', precision: 2},
    ],
    rows: [
        {
            cells: [
                {value: 'Не заполнено', fieldId: 'wall_material-1'},
                {value: 67, fieldId: 'iznos-0', type: 'number'},
            ],
        },
        {
            cells: [
                {value: 'Не заполнено', fieldId: 'wall_material-1'},
                {value: 100, fieldId: 'iznos-0', type: 'number'},
            ],
        },
        {
            cells: [
                {value: 'Смешанные', fieldId: 'wall_material-1'},
                {value: 70, fieldId: 'iznos-0', type: 'number'},
            ],
        },
        {
            cells: [
                {value: 'Деревянные', fieldId: 'wall_material-1'},
                {value: 40, fieldId: 'iznos-0', type: 'number'},
            ],
        },
        {
            cells: [
                {value: 'Не заполнено', fieldId: 'wall_material-1'},
                {value: null, fieldId: 'iznos-0'},
            ],
        },
        {
            cells: [
                {value: 'Не заполнено', fieldId: 'wall_material-1'},
                {value: null, fieldId: 'iznos-0'},
            ],
        },
        {
            cells: [
                {value: 'Не заполнено', fieldId: 'wall_material-1'},
                {value: null, fieldId: 'iznos-0'},
            ],
        },
        {
            cells: [
                {value: 'Кирпич', fieldId: 'wall_material-1'},
                {value: 78, fieldId: 'iznos-0', type: 'number'},
            ],
        },
        {
            cells: [
                {value: 'Деревянные', fieldId: 'wall_material-1'},
                {value: 67, fieldId: 'iznos-0', type: 'number'},
            ],
        },
        {
            cells: [
                {value: 'Не заполнено', fieldId: 'wall_material-1'},
                {value: 72, fieldId: 'iznos-0', type: 'number'},
            ],
        },
    ],
};
