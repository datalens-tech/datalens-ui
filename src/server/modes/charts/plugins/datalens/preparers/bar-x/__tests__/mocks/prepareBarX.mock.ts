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

export function getPrepareFunctionArgs(options: Partial<PrepareFunctionArgs> = {}) {
    return merge(cloneDeep(prepareBarXArgs), options) as unknown as PrepareFunctionArgs;
}
