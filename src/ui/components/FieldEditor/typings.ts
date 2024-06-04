import type {DatasetField} from '../../../shared';

import type {DUPLICATE_TITLE, EMPTY_SOURCE, EMPTY_TITLE, INVALID_ID} from './constants';

export interface FieldEditorErrors {
    [DUPLICATE_TITLE]: boolean;
    [EMPTY_SOURCE]: boolean;
    [EMPTY_TITLE]: boolean;
    [INVALID_ID]: boolean;
}

export type ModifiedDatasetField = DatasetField & {new_id?: string};

export type ModifyField = (
    updates: Partial<ModifiedDatasetField>,
    errorUpdates?: Partial<FieldEditorErrors>,
) => void;

export type Cancelable = any;
