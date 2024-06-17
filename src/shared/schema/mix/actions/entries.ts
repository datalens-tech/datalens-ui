import keyBy from 'lodash/keyBy';
import type {Required} from 'utility-types';

import {createAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import type {GetRelationsEntry, SwitchPublicationStatusResponse} from '../../us/types';
import {escapeStringForLike, filterDatasetsIdsForCheck} from '../helpers';
import {isValidPublishLink} from '../helpers/validation';
import type {
    DeleteEntryArgs,
    DeleteEntryResponse,
    GetEntriesInFolderArgs,
    GetEntriesInFolderResponse,
    GetEntryMetaStatusArgs,
    GetEntryMetaStatusResponse,
    GetEntryRelationsArgs,
    GetEntryRelationsResponse,
    GetPublicationPreviewArgs,
    GetPublicationPreviewResponse,
    MixedSwitchPublicationStatusArgs,
    ResolveEntryByLinkArgs,
    ResolveEntryByLinkResponse,
} from '../types';

export const entriesActions = {
    deleteEntry: createAction<DeleteEntryResponse, DeleteEntryArgs>(async (api, args) => {
        const typedApi = getTypedApi(api);
        const {entryId, lockToken, scope} = args;
        switch (scope) {
            case 'dataset': {
                const data = await typedApi.bi.deleteDataset({datasetId: entryId});
                return data;
            }
            case 'connection': {
                const data = await typedApi.bi.deleteConnnection({connectionId: entryId});
                return data;
            }
            default: {
                const data = await typedApi.us._deleteUSEntry({entryId, lockToken});
                return data;
            }
        }
    }),
    getPublicationPreview: createAction<GetPublicationPreviewResponse, GetPublicationPreviewArgs>(
        async (api, {entryId, workbookId}) => {
            const typedApi = getTypedApi(api);
            const relations = (await typedApi.us.getRelations({
                entryId,
                includePermissionsInfo: true,
            })) as Required<GetRelationsEntry, 'permissions'>[];
            const filteredDatasetsIds = filterDatasetsIdsForCheck(relations);
            if (filteredDatasetsIds.length) {
                const {result: datasets} = await typedApi.bi.checkDatasetsForPublication({
                    datasetsIds: filteredDatasetsIds,
                    workbookId,
                });
                const normalizedDatasets = keyBy(datasets, (dataset) => dataset.dataset_id);
                return relations.map((entry) => {
                    const datasetEntry = normalizedDatasets[entry.entryId];
                    const lockPublication = Boolean(datasetEntry && !datasetEntry.allowed);
                    return {
                        ...entry,
                        lockPublication,
                        lockPublicationReason: lockPublication ? datasetEntry.reason : null,
                    };
                });
            }
            return relations.map((entry) => ({
                ...entry,
                lockPublication: false,
                lockPublicationReason: null,
            }));
        },
    ),
    switchPublicationStatus: createAction<
        SwitchPublicationStatusResponse,
        MixedSwitchPublicationStatusArgs
    >(async (api, {entries, mainEntry, workbookId}) => {
        if (!isValidPublishLink(mainEntry?.unversionedData?.publicAuthor?.link)) {
            throw new Error('Failed to publish dashboard - invalid publish link.');
        }

        const typedApi = getTypedApi(api);
        const filteredDatasetsIds = filterDatasetsIdsForCheck(entries);
        if (filteredDatasetsIds.length) {
            const {result: datasets} = await typedApi.bi.checkDatasetsForPublication({
                datasetsIds: filteredDatasetsIds,
                workbookId,
            });
            if (datasets.some((datasetEntry) => !datasetEntry.allowed)) {
                const errorMessage = JSON.stringify(
                    datasets
                        .filter(({allowed}) => !allowed)
                        .map(({dataset_id: entryId, reason}) => ({entryId, reason})),
                    null,
                    4,
                );
                throw new Error(`Failed to publish datasets:\n ${errorMessage}`);
            }
        }
        const result = await typedApi.us._switchPublicationStatus({entries, mainEntry});
        return result;
    }),
    resolveEntryByLink: createAction<ResolveEntryByLinkResponse, ResolveEntryByLinkArgs>(
        async (api, {url}, {ctx}) => {
            const typedApi = getTypedApi(api);
            const {resolveEntryByLink} = ctx.get('gateway');
            const result = await resolveEntryByLink({
                originalUrl: url,
                ctx,
                getEntryMeta: typedApi.us.getEntryMeta,
                getEntryByKey: typedApi.us.getEntryByKey,
            });
            return result;
        },
    ),
    getEntryMetaStatus: createAction<GetEntryMetaStatusResponse, GetEntryMetaStatusArgs>(
        async (api, args) => {
            const typedApi = getTypedApi(api);
            const {entryId} = args;
            try {
                await typedApi.us.getEntryMeta({entryId});
                return {code: 'OK'};
            } catch (errorWrapper) {
                let error;
                if (errorWrapper instanceof Object && 'error' in errorWrapper) {
                    error = errorWrapper.error;
                }
                if (typeof error === 'object' && error !== null && 'status' in error) {
                    switch (error.status) {
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
        },
    ),
    getEntriesInFolder: createAction<GetEntriesInFolderResponse, GetEntriesInFolderArgs>(
        async (api, {folderId}) => {
            const typedApi = getTypedApi(api);
            const folderEntry = await typedApi.us.getEntry({
                entryId: folderId,
                includePermissionsInfo: true,
            });
            if (folderEntry.permissions?.admin !== true) {
                throw new Error('Forbidden');
            }
            const entries = await typedApi.us._getEntriesByKeyPattern({
                keyPattern: `${escapeStringForLike(folderEntry.key)}%`,
            });
            const yqlFolderKey = 'yql/charts/';
            return entries.filter(({key}) => !key.toLowerCase().startsWith(yqlFolderKey));
        },
    ),
    getEntryRelations: createAction<GetEntryRelationsResponse, GetEntryRelationsArgs>(
        async (api, {entryId, direction = 'parent'}) => {
            const typedApi = getTypedApi(api);
            const relations = (await typedApi.us.getRelations({
                entryId,
                direction,
            })) as Required<GetRelationsEntry, 'permissions'>[];

            return relations;
        },
    ),
};
