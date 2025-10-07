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
