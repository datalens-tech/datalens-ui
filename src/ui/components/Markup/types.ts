import {MarkupItemTypeDict} from './constants';

const items = Object.values(MarkupItemTypeDict);
export type MarkupItemType = typeof items[number];

type BaseMarkupItem = {
    type: MarkupItemType;
    children?: (MarkupItem | string)[];
    color?: string;
    content?: string | MarkupItem;
    size?: string | number;
    url?: string;
    className?: string;
};

export type UserInfoMarkupItem = {
    type: typeof MarkupItemTypeDict.UserInfo;
    user_info: 'name' | 'email';
    content: string;
    className?: string;
    children?: [];
};

export type MarkupItem = BaseMarkupItem | UserInfoMarkupItem;
