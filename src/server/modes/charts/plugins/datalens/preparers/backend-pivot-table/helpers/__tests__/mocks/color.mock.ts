import {ServerField} from '../../../../../../../../../../shared';
import {ChartColorsConfig} from '../../../../../types';
import {AnnotationsMap, PivotDataRows} from '../../../types';

export const MOCKED_PIVOT_DATA_ROWS = [
    {
        header: [[['Australia', 1, 1]]],
        values: [
            [
                ['657.058', 2, 2],
                ['90402', 3, 3],
            ],
            [
                ['2901.739000000002', 2, 2],
                ['2120777', 3, 3],
            ],
        ],
    },
    {
        header: [[['Austria', 1, 1]]],
        values: [
            [
                ['7.891', 2, 2],
                ['5555', 3, 3],
            ],
            [
                ['661.3510000000002', 2, 2],
                ['142023', 3, 3],
            ],
        ],
    },
    {
        header: [[['Azerbaijan', 1, 1]]],
        values: [
            [
                ['12.363', 2, 2],
                ['156', 3, 3],
            ],
            [
                ['113.76400000000002', 2, 2],
                ['4748', 3, 3],
            ],
        ],
    },
] as PivotDataRows[];

export const MOCKED_PIVOT_DATA_ROWS_WITH_FALSY_VALUES = [
    {
        header: [[['Australia', 1, 1]]],
        values: [
            [
                ['657.058', 2, 2],
                [undefined, 3, 3],
            ],
            [
                ['2901.739000000002', 2, 2],
                [null, 3, 3],
            ],
            [
                ['23141.739000000002', 2, 2],
                ['', 3, 3],
            ],
        ],
    },
] as PivotDataRows[];

export const MOCKED_PIVOT_DATA_ROWS_WITH_EMPTY_CELL = [
    {
        header: [[['Australia', 1, 1]]],
        values: [
            [
                ['657.058', 2, 2],
                ['425.23', 3, 3],
            ],
            null,
        ],
    },
] as PivotDataRows[];

export const MOCKED_PIVOT_DATA_ROWS_WITH_INVALID_VALUES = [
    {
        header: [[['Australia', 1, 1]]],
        values: [
            [
                ['147.99', 2, 2],
                ['4205.45', 3, 3],
            ],
            [
                ['657.058', 2, 2],
                [null, 3, 3],
            ],
            [
                ['123.128', 2, 2],
                [undefined, 3, 3],
            ],
            [
                ['8472.08', 2, 2],
                ['', 3, 3],
            ],
            [
                ['55', 2, 2],
                [NaN, 3, 3],
            ],
            [
                ['265.2', 2, 2],
                ['abc', 3, 3],
            ],
        ],
    },
] as PivotDataRows[];

export const MOCKED_PIVOT_ANNOTATIONS_MAP = {
    [3]: 'color',
} as AnnotationsMap;

export const MOCKED_PIVOT_COLORS_CONFIG = {
    gradientColors: ['#0044A3', '#8CCBFF'],
} as ChartColorsConfig;

export const MOCKED_COLORS_FIELDS = [
    {
        type: 'MEASURE',
        guid: '5b58a23b-68a2-4979-bfb3-9ee13f16d24d',
    },
] as ServerField[];

export const MOCKED_COLORS_FIELDS_MEASURE_NAME = [
    {
        type: 'PSEUDO',
        title: 'Measure Names',
        guid: 'Measure Names',
    },
] as ServerField[];

export const MOCKED_PIVOT_ROWS = [
    {
        cells: [
            {
                id: 0,
                value: 'Australia',
                isTotalCell: false,
            },
            {
                id: 1,
                value: 657.058,
                formattedValue: '657,06',
            },
            {
                id: 2,
                value: 2901.739000000002,
                formattedValue: '2 901,74',
            },
        ],
    },
    {
        cells: [
            {
                id: 3,
                value: 'Austria',
                isTotalCell: false,
            },
            {
                id: 4,
                value: 7.891,
                formattedValue: '7,89',
            },
            {
                id: 5,
                value: 661.3510000000002,
                formattedValue: '661,35',
            },
        ],
    },
];
