import type {DatasetField, DatasetFieldError} from 'shared';

import {makeDefaultEmpty} from '../../components/DefaultEmpty';

export interface AdditionalButtonsProps {
    toggleAdditionalPanel: () => void;
    showLabel?: boolean;
}
export interface AdditionalButtonsWrapperProps {
    toggleAdditionalPanel: () => void;
}
export interface AdditionalPanelProps {
    visible: boolean;
    onClose: () => void;
    field: DatasetField;
    fields: DatasetField[];
    fieldErrors: DatasetFieldError[];
}

export const fieldEditorComponentsMap = {
    // TODO: remove AdditionalButtons key after CHARTS-11777 complete (closed part)
    AdditionalButtons: makeDefaultEmpty<AdditionalButtonsProps>(),
    AdditionalPanel: makeDefaultEmpty<AdditionalPanelProps>(),
    AdditionalButtonsWrapper: makeDefaultEmpty<AdditionalButtonsWrapperProps>(),
} as const;
