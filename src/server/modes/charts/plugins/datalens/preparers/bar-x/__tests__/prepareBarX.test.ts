import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';
import uniq from 'lodash/uniq';

import {
    DATASET_FIELD_TYPES,
    IChartEditor,
    ServerColor,
    ServerField,
    ServerShape,
} from '../../../../../../../../shared';
import {PrepareFunctionArgs} from '../../types';
import {prepareBarX} from '../prepareBarX';

const DATASET_ID = 'j43msj9o23ge9';

const X1_FIELD = {
    datasetId: DATASET_ID,
    title: 'X1Field',
    guid: 'guidX1',
    data_type: DATASET_FIELD_TYPES.GENERICDATETIME,
} as ServerField;
const X2_FIELD = {
    datasetId: DATASET_ID,
    title: 'X2Field',
    guid: 'guidX2',
    data_type: DATASET_FIELD_TYPES.STRING,
} as ServerField;

const Y_FIELD = {
    datasetId: DATASET_ID,
    title: 'YField',
    guid: 'a6b94410-e219-11e9-a279-0b30c0a74ab7',
    data_type: DATASET_FIELD_TYPES.FLOAT,
} as ServerField;

export const COLOR_FIELD = {
    datasetId: DATASET_ID,
    title: 'ColorField',
    guid: '38e0b1f4-d46b-48a0-8905-6a6d1e61900d',
    data_type: DATASET_FIELD_TYPES.STRING,
} as ServerColor;

export const SHAPE_FIELD = {
    datasetId: DATASET_ID,
    title: 'ShapeField',
    guid: '45bdfbb6-1dd9-41bd-9871-b011efd8ec6b',
    data_type: DATASET_FIELD_TYPES.STRING,
} as ServerShape;

export const PREPARE_FUNCTION_ARGS = {
    ChartEditor: {
        getWidgetConfig: () => {},
    } as IChartEditor,
    colors: [],
    colorsConfig: {loadedColorPalettes: {}, colors: ['blue', 'red', 'orange'], gradientColors: []},
    datasets: [],
    fields: [],
    shapes: [],
    sort: [],
    segments: [],
    visualizationId: 'scatter',
    shared: {},
    idToDataType: {
        [X1_FIELD.guid]: X1_FIELD.data_type,
        [X2_FIELD.guid]: X2_FIELD.data_type,
        [Y_FIELD.guid]: Y_FIELD.data_type,
        [COLOR_FIELD.guid]: COLOR_FIELD.data_type,
        [SHAPE_FIELD.guid]: SHAPE_FIELD.data_type,
    } as Record<string, DATASET_FIELD_TYPES>,
    idToTitle: {
        [X1_FIELD.guid]: X1_FIELD.title,
        [X2_FIELD.guid]: X2_FIELD.title,
        [Y_FIELD.guid]: Y_FIELD.title,
        [COLOR_FIELD.guid]: COLOR_FIELD.title,
        [SHAPE_FIELD.guid]: SHAPE_FIELD.title,
    },
    placeholders: [
        {
            id: 'x',
            items: [X1_FIELD],
        },
        {
            id: 'y',
            items: [Y_FIELD],
        },
    ],
    resultData: {
        data: [],
        order: [X1_FIELD, Y_FIELD],
        totals: [],
    },
};

function getPrepareFunctionArgs(options: Partial<PrepareFunctionArgs> = {}) {
    return merge(cloneDeep(PREPARE_FUNCTION_ARGS), options) as unknown as PrepareFunctionArgs;
}

describe('prepareBarX: legendTitle', () => {
    test('two fields in X section -> legendTitle should be constructed as "[X second field name]: [X second field value]"', () => {
        const options = getPrepareFunctionArgs({
            placeholders: [
                {
                    id: 'x',
                    items: [X1_FIELD, X2_FIELD],
                },
                {
                    id: 'y',
                    items: [Y_FIELD],
                },
            ],
            resultData: {
                data: [
                    ['2023-05-11T00:00:00', 'A', '10'],
                    ['2023-05-11T00:00:00', 'B', '11'],
                    ['2023-05-11T00:00:00', 'A', '15'],
                    ['2023-05-11T00:00:00', 'B', '100'],
                ],
                order: [X1_FIELD, X2_FIELD, Y_FIELD],
                totals: [],
            },
        });
        const result = prepareBarX(options);
        const items = uniq(result.graphs.map((item) => item.legendTitle));

        expect(items).toEqual(['X2Field: A', 'X2Field: B']);
    });

    test('two fields in X section and filed in Colors section -> legendTitle should be constructed as "[Color field value]", series id must match the legend title', () => {
        const options = getPrepareFunctionArgs({
            placeholders: [
                {
                    id: 'x',
                    items: [X1_FIELD, X2_FIELD],
                },
                {
                    id: 'y',
                    items: [Y_FIELD],
                },
            ],
            colors: [COLOR_FIELD],
            resultData: {
                data: [
                    ['2023-05-11T00:00:00', 'A', '10', 'Color-1'],
                    ['2023-05-11T00:00:00', 'B', '11', 'Color-1'],
                    ['2023-05-11T00:00:00', 'A', '15', 'Color-2'],
                    ['2023-05-11T00:00:00', 'B', '100', 'Color-2'],
                ],
                order: [X1_FIELD, X2_FIELD, Y_FIELD, COLOR_FIELD],
                totals: [],
            },
        });
        const result = prepareBarX(options);
        const legendTitles = uniq(result.graphs.map((item) => item.legendTitle));
        const seriesIds = uniq(result.graphs.map((item) => item.legendTitle));

        expect(legendTitles).toEqual(['Color-1', 'Color-2']);
        expect(seriesIds).toEqual(legendTitles);
    });
});
