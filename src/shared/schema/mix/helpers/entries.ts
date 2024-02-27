import get from 'lodash/get';

import {WizardVisualizationId} from '../../../constants';
import {Shared} from '../../../types';
import {EntryFields, GetEntriesEntryResponse} from '../../us/types';

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

export function getEntryVisualizationType(entry: GetEntriesEntryResponse) {
    const sharedData = get(entry.data, 'shared');
    const shared: Shared | null = typeof sharedData === 'string' ? JSON.parse(sharedData) : null;

    return shared?.visualization.id as WizardVisualizationId | undefined;
}
