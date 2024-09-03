import type {IChartEditor, ServerField} from '../../../../../../../shared';
import {DATASET_FIELD_TYPES} from '../../../../../../../shared';
import type {PrepareFunctionArgs} from '../types';

export const EmptyPrepapreArgs: PrepareFunctionArgs = {
    ChartEditor: {
        getWidgetConfig: () => {},
    } as IChartEditor,
    // @ts-ignore
    shared: {},
    sort: [],
    colors: [],
    colorsConfig: {
        loadedColorPalettes: {},
        colors: ['blue', 'red', 'orange'],
        gradientColors: [],
        availablePalettes: {},
    },
    shapes: [],
    segments: [],
    idToTitle: {},
    idToDataType: {},
    features: {},
};

const datasetId = 'datasetId';

export const IntegerField = {
    datasetId,
    title: 'IntegerField_title',
    guid: 'IntegerField_guid',
    data_type: DATASET_FIELD_TYPES.INTEGER,
} as ServerField;

export const DateTimeField = {
    datasetId,
    title: 'DateTimeField_title',
    guid: 'DateTimeField_guid',
    data_type: DATASET_FIELD_TYPES.GENERICDATETIME,
} as ServerField;
