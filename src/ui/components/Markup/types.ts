import {MarkupItemTypeDict} from './constants';

const items = Object.values(MarkupItemTypeDict);
export type MarkupItemType = typeof items[number];

export type MarkupItem = {
    type: MarkupItemType;
    children?: (MarkupItem | string)[];
    color?: string;
    content?: string | MarkupItem;
    size?: string | number;
    url?: string;
    className?: string;
    user_info?: 'name' | 'email';
};
