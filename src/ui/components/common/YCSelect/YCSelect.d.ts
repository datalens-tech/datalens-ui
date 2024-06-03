import type {ReactNode} from 'react';
import {Component} from 'react';

export interface YCSelectItem {
    value: string | number;
    title: ReactNode;
    hint?: string;
    key?: string;
    meta?: string;
    icon?: ReactNode;
    disabled?: boolean;
    modifier?: string;
    url?: string;
}

export interface YCSelectItemsGroup {
    groupTitle: string;
    items: YCSelectItem[];
}

export interface YCSelectPopupState {
    open: boolean;
}

export type YCSelectType = 'single' | 'multiple';
export type YCSelectItemValue<T extends YCSelectType> = 'single' extends T ? string : string[];
export type YCSelectNextPageToken = number | string;

export interface YCSelectGetItemsArgsInitItems {
    exactKeys: string[];
}
export interface YCSelectGetItemsArgsFetchItems {
    searchPattern?: string;
    itemsPageSize?: number;
    nextPageToken?: YCSelectNextPageToken;
}
export type YCSelectGetItemsArgs = YCSelectGetItemsArgsInitItems | YCSelectGetItemsArgsFetchItems;

interface YCSelectProps<T extends YCSelectType> {
    type?: T;
    value?: YCSelectItemValue<T>;
    getItems?: (getItemsArgs: YCSelectGetItemsArgs) => Promise<{
        items: YCSelectItem[];
        nextPageToken?: YCSelectNextPageToken;
    }>;
    addItem?: (value: string) => void;
    renderSwitcher?: () => ReactNode;
    size?: string;
    className?: string;
    popupClassName?: string;
    switcherClassName?: string;
    controlTestAnchor?: string;
    itemsListTestAnchor?: string;
    label?: string;
    controlWidth?: number;
    popupWidth?: number;
    itemsPageSize?: number;
    virtualizeThreshold?: number;
    showSearch?: boolean;
    showArrow?: boolean;
    showApply?: boolean;
    showItemIcon?: boolean;
    showItemMeta?: boolean;
    showMissingItems?: boolean;
    showSelectAll?: boolean;
    allowEmptyValue?: boolean;
    allowNullableValues?: boolean;
    hiding?: boolean;
    disabled?: boolean;
    stretched?: boolean;
    loading?: boolean;
    loadingItems?: boolean;
    applyOnOutsideClick?: boolean;
    items?: YCSelectItem[] | YCSelectItemsGroup[];
    initialItems?: YCSelectItem[];
    placeholder?:
        | string
        | {
              text: string;
              icon: ReactNode;
          };

    onFetchErrorDetails?: (error: any) => void;
    fetchErrorDetailsTitle?: string;

    onUpdate: (
        value: YCSelectItemValue<T>,
        opts: {items: 'single' extends T ? YCSelectItem : YCSelectItem[]; isOutsideClick: boolean},
    ) => void;
    onOpenChange?: (popupState: YCSelectPopupState) => void;
}

export const YCSelectDefaultProps: Partial<YCSelectProps<any>>;
/** @deprecated use [Select](https://github.com/gravity-ui/uikit/tree/main/src/components/Select) instead */
export class YCSelect<T extends YCSelectType> extends Component<YCSelectProps<T>> {
    static readonly SINGLE: 'single';
    static readonly MULTIPLE: 'multiple';
}
