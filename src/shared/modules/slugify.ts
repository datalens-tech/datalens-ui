import {ENTRY_SLUG_SEPARATOR, MAX_SLUG_LENGTH} from '../constants';

import {transliterate} from './transliterate';

export function slugify(str: string, maxSlugLength: number = MAX_SLUG_LENGTH) {
    return transliterate(str)
        .replace(/\s+|_+|\.+/g, '-') // replace the whitespace characters, '.' and '_' with '-'
        .replace(/[^a-z0-9-]+/g, '') // we remove all non-alphanumeric, numeric and '-' characters
        .replace(/-+/g, '-') // replacing multiple '-' with single '-'
        .slice(0, maxSlugLength)
        .replace(/^-+/, '') // delete the '-' at the beginning of the text
        .replace(/-+$/, ''); // delete the '-' at the end of the text
}

export function isSlugified(str: string, maxSlugLength: number = Number.MAX_SAFE_INTEGER) {
    return str === slugify(str, maxSlugLength);
}

export function makeSlugName(entryId: string, name: string) {
    if (!name) {
        return entryId;
    }
    const slugName = slugify(name);
    if (!slugName) {
        return entryId;
    }
    return `${entryId}${ENTRY_SLUG_SEPARATOR}${slugify(name)}`;
}
