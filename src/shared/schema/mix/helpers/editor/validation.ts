import isPlainObject from 'lodash/isPlainObject';

import type {EntryFieldData} from '../../../us/types';

type MetaTab = {
    links?: Record<string, string>;
};

const AVAILABLE_META_TAB_KEYS: Array<keyof MetaTab> = ['links'];

function validateMetaTab(tabContent?: unknown) {
    if (!tabContent || typeof tabContent !== 'string') {
        return;
    }

    let metaTab: MetaTab;

    try {
        metaTab = JSON.parse(tabContent);
    } catch {
        throw new Error('Meta must be a valid JSON\n');
    }

    if (!isPlainObject(metaTab)) {
        throw new Error('Meta must be an object\n');
    }

    if ('links' in metaTab && !isPlainObject(metaTab.links)) {
        throw new Error('"links" property must be an object\n');
    }

    if (metaTab.links) {
        const unsupportedTypeKys: string[] = [];
        Object.entries(metaTab.links).forEach(([key, value]) => {
            if (typeof value !== 'string') {
                unsupportedTypeKys.push(key);
            }
        });

        if (unsupportedTypeKys.length) {
            throw new Error(
                `Next keys in "linlk" property has unsupported types: ${unsupportedTypeKys.join(', ')}. They must have a "string" type\n`,
            );
        }
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
