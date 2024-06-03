import type {ListItemData} from '@gravity-ui/uikit';

export type TabMenuItemData<T> = ListItemData<T> & {title?: string; isDefault?: boolean};

export enum TabActionType {
    Add = 'add',
    Delete = 'delete',
    ChangeChosen = 'changeChosen',
    ChangeDefault = 'changeDefault',
    Paste = 'paste',
    Skipped = 'skipped',
}

type ListState<T> = {
    items: TabMenuItemData<T>[];
    selectedItemIndex: number;
    action?: TabActionType;
};

type SkippedListState<T> = {
    action: TabActionType.Skipped;
} & Partial<Omit<ListState<T>, 'action'>>;

export type UpdateState<T> = ListState<T> | SkippedListState<T>;

export type TabMenuProps<T> = {
    items: TabMenuItemData<T>[];
    selectedItemIndex: number;
    update: ({items, selectedItemIndex, action}: UpdateState<T>) => void;
    enableActionMenu?: boolean;
    addButtonText?: string;
    pasteButtonText?: string;
    defaultTabText?: () => string;
    tabIconMixin?: string;
    allowPaste?: boolean;
    onPasteItem?: (() => TabMenuItemData<T>[]) | null;
};
