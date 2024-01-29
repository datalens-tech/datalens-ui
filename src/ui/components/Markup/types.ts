export type MarkupItemType =
    | 'bold'
    | 'br'
    | 'color'
    | 'concat'
    | 'italics'
    | 'size'
    | 'text'
    | 'url';

export type MarkupItem = {
    type: MarkupItemType;
    children?: (MarkupItem | string)[];
    color?: string;
    content?: string | MarkupItem;
    size?: string | number;
    url?: string;
};
