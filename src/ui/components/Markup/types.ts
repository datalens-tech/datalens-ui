export type MarkupItemType = 'bold' | 'concat' | 'italics' | 'url' | 'text';

export type MarkupItem = {
    type: MarkupItemType;
    url?: string;
    children?: (MarkupItem | string)[];
    content?: string | MarkupItem;
};
