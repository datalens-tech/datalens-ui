import isPlainObject from 'lodash/isPlainObject';

import type {EntryFieldData} from '../../../us/types';

type MetaTabLinks = {
    [key: string]: MetaTabLinks | string;
};
type MetaTab = {
    links?: MetaTabLinks;
};

const AVAILABLE_META_TAB_KEYS: Array<keyof MetaTab> = ['links'];

function validateMetaTab(value?: unknown) {
    if (!value || typeof value !== 'string') {
        return;
    }

    let metaTab: MetaTab;

    try {
        metaTab = JSON.parse(value);
    } catch {
        throw new Error('Meta must be a valid JSON\n');
    }

    if (!isPlainObject(metaTab)) {
        throw new Error('Meta must be an object\n');
    }

    if ('links' in metaTab && !isPlainObject(metaTab.links)) {
        throw new Error('"links" property must be an object\n');
    }

    const unknownKeys: string[] = [];

    Object.keys(metaTab).forEach((key) => {
        if (!AVAILABLE_META_TAB_KEYS.includes(key as keyof MetaTab)) {
            unknownKeys.push(key);
        }
    });

    if (unknownKeys.length) {
        throw new Error(`Unknown keys in tab "meta": ${unknownKeys.join(', ')}\n`);
    }
}

export function validateData(data: EntryFieldData<Record<string, unknown>>) {
    if (!data) {
        return;
    }

    validateMetaTab(data.meta);
}
