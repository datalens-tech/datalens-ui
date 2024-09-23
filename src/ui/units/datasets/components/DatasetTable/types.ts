import type {MenuItemProps} from '@gravity-ui/uikit';
import type {DatasetField} from 'shared';

import type {FieldAction} from './constants';

export type ColumnItem = {
    index: number;
    setActiveRow: (index?: number) => void;
};

export type MenuItem = {
    action: FieldAction;
    label: string;
    theme?: MenuItemProps['theme'];
    hidden?: boolean;
};

export type UpdatePayload = {
    debounce?: boolean;
    validateEnabled?: boolean;
    updatePreview?: boolean;
};

export type BatchUpdateFields = (
    data: UpdatePayload & {
        fields: Partial<DatasetField>[] & {new_id?: string}[];
    },
) => void;
