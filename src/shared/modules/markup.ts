import isPlainObject from 'lodash/isPlainObject';

import {MarkupItem} from '../types';

export function isMarkupItem(obj: unknown): obj is MarkupItem {
    return isPlainObject(obj) && isMarkupObject(obj as object);
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
