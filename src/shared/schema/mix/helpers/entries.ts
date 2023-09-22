import {EntryFields} from '../../us/types';

export function filterDatasetsIdsForCheck(entries: Pick<EntryFields, 'entryId' | 'scope'>[]) {
    return entries
        .filter((entry) => {
            if (!('scope' in entry)) {
                throw new Error("Entry should have required field 'scope'");
            }
            return entry.scope === 'dataset';
        })
        .map(({entryId}) => entryId);
}

export function escapeStringForLike(str: string) {
    return str.replace(/[%_]/g, '\\$&');
}
