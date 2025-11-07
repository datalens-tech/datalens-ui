import get from 'lodash/get';

import type {WizardVisualizationId} from '../../../constants';
import {EntryScope, type Shared, type WorkbookId} from '../../../types';
import type {TypedApi} from '../../simple-schema';
import type {
    CheckConnectionsForPublicationResponse,
    CheckDatasetsForPublicationResponse,
    GetEntryMetaStatusResponse,
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

export function getEntryMetaStatusByError(errorWrapper: unknown): GetEntryMetaStatusResponse {
    let error;
    if (errorWrapper instanceof Object && 'error' in errorWrapper) {
        error = errorWrapper.error;
    }
    if (typeof error === 'object' && error !== null && 'status' in error) {
        switch (error.status) {
            case 400:
                // us ajv validation
                if ('code' in error && error.code === 'DECODE_ID_FAILED') {
                    return {code: 'NOT_FOUND'};
                }
                // us zod validation
                if ('code' in error && error.code === 'VALIDATION_ERROR') {
                    const path = get(error, ['details', 'details', 0, 'path', 0]);
                    if (path === 'entryId') {
                        return {code: 'NOT_FOUND'};
                    }
                }
                return {code: 'UNHANDLED'};
            case 403:
                return {code: 'FORBIDDEN'};
            case 404:
                return {code: 'NOT_FOUND'};
            default:
                return {code: 'UNHANDLED'};
        }
    } else {
        return {code: 'UNHANDLED'};
    }
}
