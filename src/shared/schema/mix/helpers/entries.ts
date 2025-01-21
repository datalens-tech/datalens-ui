import get from 'lodash/get';

import type {WizardVisualizationId} from '../../../constants';
import {EntryScope, type Shared, type WorkbookId} from '../../../types';
import type {TypedApi} from '../../simple-schema';
import type {
    CheckConnectionsForPublicationResponse,
    CheckDatasetsForPublicationResponse,
} from '../../types';
import type {EntryFields} from '../../us/types';

export function filterEntirsForCheck(entries: Pick<EntryFields, 'entryId' | 'scope'>[]) {
    const datasetIds: string[] = [];
    const connectionsIds: string[] = [];

    entries.forEach((entry) => {
        if (!('scope' in entry)) {
            throw new Error("Entry should have required field 'scope'");
        }

        if (entry.scope === EntryScope.Dataset) {
            datasetIds.push(entry.entryId);
        } else if (entry.scope === EntryScope.Connection) {
            connectionsIds.push(entry.entryId);
        }
    });
    return {datasetIds, connectionsIds};
}

export function escapeStringForLike(str: string) {
    return str.replace(/[%_]/g, '\\$&');
}

export function getEntryVisualizationType(entry: Partial<EntryFields>) {
    try {
        const sharedData = get(entry, 'data.shared');
        const shared: Shared | null =
            typeof sharedData === 'string' ? JSON.parse(sharedData) : null;
        return shared?.visualization?.id as WizardVisualizationId | undefined;
    } catch (e) {
        return undefined;
    }
}

export function getEntryHierarchy(entry: Partial<EntryFields>) {
    try {
        const sharedData = get(entry, 'data.shared');
        const shared: Shared | null =
            typeof sharedData === 'string' ? JSON.parse(sharedData) : null;
        return shared?.hierarchies;
    } catch (e) {
        return undefined;
    }
}

export const checkEntriesForPublication = async ({
    entries,
    typedApi,
    workbookId,
}: {
    entries: Pick<EntryFields, 'entryId' | 'scope'>[];
    typedApi: TypedApi;
    workbookId: WorkbookId;
}) => {
    const {datasetIds} = filterEntirsForCheck(entries);
    const promises: [
        Promise<CheckDatasetsForPublicationResponse> | null,
        Promise<CheckConnectionsForPublicationResponse> | null,
    ] = [null, null];

    if (datasetIds.length) {
        promises[0] = typedApi.bi.checkDatasetsForPublication({
            datasetsIds: datasetIds,
            workbookId,
        });
    }
    // if (connectionsIds.length) {
    //     promises[1] = typedApi.bi.checkConnectionsForPublication({
    //         connectionsIds: connectionsIds,
    //         workbookId,
    //     });
    // }

    return Promise.all(promises);
};
