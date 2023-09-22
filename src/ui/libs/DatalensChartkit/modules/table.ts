import isPlainObject from 'lodash/isPlainObject';

import type {MarkupItem} from '../../../components/Markup';

export function markupToRawString(obj: MarkupItem, str = ''): string {
    let text = str;

    if (obj.children) {
        text =
            text +
            obj.children
                .map((item) => (typeof item === 'object' ? markupToRawString(item, text) : text))
                .join('');
    } else if (obj.content && typeof obj.content === 'string') {
        text = text + obj.content;
    } else if (obj.content && typeof obj.content === 'object') {
        text = markupToRawString(obj.content, text);
    }

    return text;
}

export function isMarkupItem(obj: object): boolean {
    return isPlainObject(obj) && isMarkupObject(obj);
}

function isMarkupObject(obj: {type?: string}): boolean {
    if (
        (obj.type === 'concat' ||
            obj.type === 'italics' ||
            obj.type === 'url' ||
            obj.type === 'bold') &&
        ('children' in obj || 'content' in obj)
    ) {
        return true;
    }
    {
        return false;
    }
}
