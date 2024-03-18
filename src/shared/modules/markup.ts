import isPlainObject from 'lodash/isPlainObject';

import {MarkupItem, MarkupItemType, MarkupItemTypes} from '../types';

export function isMarkupItem(obj: unknown): obj is MarkupItem {
    return isPlainObject(obj) && isMarkupObject(obj as object);
}

function isMarkupObject(obj: {type?: string}): boolean {
    if (
        obj.type &&
        Object.values(MarkupItemTypes).includes(obj.type as MarkupItemType) &&
        ('children' in obj || 'content' in obj)
    ) {
        return true;
    }
    {
        return false;
    }
}
