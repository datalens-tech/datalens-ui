import type {IChartEditor, ServerField} from '../../../../../../../shared';
import {COMMON_PALETTE_ID, DATASET_FIELD_TYPES} from '../../../../../../../shared';
import classic20 from '../../../../../../../shared/constants/colors/common/classic-20';
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
        availablePalettes: {[COMMON_PALETTE_ID.CLASSIC_20]: classic20},
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
