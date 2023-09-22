import {MenuItemProps} from '@gravity-ui/uikit';

import {FieldAction} from './constants';

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
