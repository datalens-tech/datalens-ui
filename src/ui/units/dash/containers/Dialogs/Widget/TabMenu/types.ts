import type {ListItemData} from '@gravity-ui/uikit';
import type {CopiedConfigData} from 'ui/units/dash/modules/helpers';

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
    onUpdate: ({items, selectedItemIndex, action}: UpdateState<T>) => void;
    enableActionMenu?: boolean;
    addButtonText?: string;
    pasteButtonText?: string;
    defaultTabText?: () => string;
    tabIconMixin?: string;
    onPasteItems?: (pasteConfig: CopiedConfigData | null) => null | TabMenuItemData<T>[];
    canPasteItems?: (pasteConfig: CopiedConfigData | null, workbooId?: string | null) => boolean;
    addButtonView?: 'flat' | 'outlined';
    onCopyItem?: (itemIndex: number) => void;
};
