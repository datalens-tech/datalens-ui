import {
    DATASET_FIELD_TYPES,
    IChartEditor,
    ServerColor,
    ServerField,
    ServerShape,
} from '../../../../../../../../../shared';

const DATASET_ID = 'j43msj9o23ge9';

const X_FIELD = {
    datasetId: DATASET_ID,
    title: 'XField',
    guid: 'cddd9cad-52a2-4232-8898-ade9a972c864',
    data_type: DATASET_FIELD_TYPES.GENERICDATETIME,
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
    visualizationId: 'scatter',
    idToDataType: {
        [X_FIELD.guid]: X_FIELD.data_type,
        [Y_FIELD.guid]: Y_FIELD.data_type,
        [COLOR_FIELD.guid]: COLOR_FIELD.data_type,
        [SHAPE_FIELD.guid]: SHAPE_FIELD.data_type,
    } as Record<string, DATASET_FIELD_TYPES>,
    idToTitle: {
        [X_FIELD.guid]: X_FIELD.title,
        [Y_FIELD.guid]: Y_FIELD.title,
        [COLOR_FIELD.guid]: COLOR_FIELD.title,
        [SHAPE_FIELD.guid]: SHAPE_FIELD.title,
    },
    placeholders: [
        {
            id: 'x',
            items: [X_FIELD],
        },
        {
            id: 'y',
            items: [Y_FIELD],
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
        order: [X_FIELD, Y_FIELD, SHAPE_FIELD, COLOR_FIELD],
        totals: [],
    },
};
