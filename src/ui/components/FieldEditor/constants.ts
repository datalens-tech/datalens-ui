import {DatasetFieldAggregation, DatasetFieldType} from '../../../shared';

export const NEW_FIELD_PROPERTIES = {
    calc_mode: 'formula',
    source: '',
    formula: '',
    description: '',
    title: '',
    type: DatasetFieldType.Dimension,
    aggregation: DatasetFieldAggregation.None,
    hidden: false,
};

export const DUPLICATE_TITLE = 'duplicateTitle';
export const EMPTY_SOURCE = 'emptySource';
export const EMPTY_TITLE = 'emptyTitle';
export const INVALID_ID = 'invalidId';

export const LEFT_PANE_MIN_WIDTH = 256;
export const LEFT_PANE_MAX_WIDTH = 512;
export const RESIZER_WIDTH = 1;
