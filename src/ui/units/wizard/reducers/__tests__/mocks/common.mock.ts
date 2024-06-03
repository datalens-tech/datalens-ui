import type {CommonUpdate, WizardDatasetField} from 'shared';
import {DATASET_FIELD_TYPES, DatasetFieldAggregation, DatasetFieldType} from 'shared';

import {LINE_VISUALIZATION} from '../../../../../constants/visualizations';

export const commonVisualizationMock = {
    ...LINE_VISUALIZATION,
} as const;

export const commonFieldMock: WizardDatasetField = {
    data_type: DATASET_FIELD_TYPES.STRING,
    description: 'Hello world!',
    managed_by: 'user',
    virtual: false,
    type: DatasetFieldType.Dimension,
    hidden: false,
    guid: 'ac8dd226-3372-4212-bde7-17afc792a728',
    initial_data_type: DATASET_FIELD_TYPES.STRING,
    cast: DATASET_FIELD_TYPES.STRING,
    title: 'Category',
    autoaggregated: false,
    valid: true,
    aggregation: DatasetFieldAggregation.None,
    source: 'Category',
    avatar_id: '7a1555b0-33c8-4643-a8ad-d41d76569b69',
    calc_mode: 'direct',
    formula: '',
    guid_formula: '',
    datasetId: '4fnqsvsxtmcix',
    id: 'dimension-9',
    datasetName: 'sample_dataset',
    has_auto_aggregation: false,
    originalDateCast: null,
    default_value: null,
    lock_aggregation: false,
    aggregation_locked: false,
} as const;

export const fieldUpdate: CommonUpdate<WizardDatasetField> = {
    action: 'add_field',
    field: {
        data_type: DATASET_FIELD_TYPES.INTEGER,
        description: '',
        managed_by: 'user',
        virtual: false,
        type: DatasetFieldType.Measure,
        hidden: false,
        guid: '49d70cc0-85f7-11ed-bc3e-7f04046f578d',
        has_auto_aggregation: false,
        initial_data_type: DATASET_FIELD_TYPES.STRING,
        cast: DATASET_FIELD_TYPES.STRING,
        lock_aggregation: false,
        title: 'title-49d70cc0-85f7-11ed-bc3e-7f04046f578d',
        autoaggregated: false,
        valid: true,
        aggregation_locked: false,
        aggregation: DatasetFieldAggregation.Countunique,
        source: 'Category',
        avatar_id: '7a1555b0-33c8-4643-a8ad-d41d76569b69',
        calc_mode: 'direct',
        formula: '',
        guid_formula: '',
        local: true,
        quickFormula: true,
        originalTitle: 'Category',
        fakeTitle: 'Category 23',
        datasetId: '4fnqsvsxtmcix',
    },
};
