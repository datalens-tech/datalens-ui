import type {ListItemData} from '@gravity-ui/uikit';

export type TabMenuItemData<T> = ListItemData<T> & {title?: string; isDefault?: boolean};

export type TabMenuProps<T> = {
    items: TabMenuItemData<T>[];
    selectedItemIndex: number;
    update: ({items, selectedItemIndex, action}: ListState<T>) => void;
    enableActionMenu?: boolean;
    addButtonText?: string;
    pasteButtonText?: string;
    defaultTabText?: () => string;
    tabIconMixin?: string;
    allowPaste?: boolean;
    onPasteItem?: (() => TabMenuItemData<T>[]) | null;
};

export type ListState<T> = {
    items: TabMenuItemData<T>[];
    selectedItemIndex: number;
    action?: TabActionType;
};

export type TabActionType = 'add' | 'delete' | 'changeChosen' | 'changeDefault' | 'paste';
