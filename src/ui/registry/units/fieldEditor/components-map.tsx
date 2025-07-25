import type {DatasetField, DatasetFieldError} from 'shared';

import {makeDefaultEmpty} from '../../components/DefaultEmpty';

export interface AdditionalButtonsProps {
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
    AdditionalButtons: makeDefaultEmpty<AdditionalButtonsProps>(),
    AdditionalPanel: makeDefaultEmpty<AdditionalPanelProps>(),
} as const;
