import keyBy from 'lodash/keyBy';
import type {Required} from 'utility-types';

import {EntryScope} from '../../../types';
import {createAction} from '../../gateway-utils';
import {getTypedApi} from '../../simple-schema';
import type {
    GetEntriesEntryResponse,
    GetRelationsEntry,
    SwitchPublicationStatusResponse,
} from '../../us/types';
import {checkEntriesForPublication, escapeStringForLike} from '../helpers';
import {isValidPublishLink} from '../helpers/validation';
import type {
    DeleteEntryArgs,
    DeleteEntryResponse,
    GetBatchEntriesByIdsArgs,
    GetBatchEntriesByIdsResponse,
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
            case EntryScope.Dataset: {
                const data = await typedApi.bi.deleteDataset({datasetId: entryId});
                return data;
            }
            case EntryScope.Connection: {
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

            const [datasets] = await checkEntriesForPublication({
                entries: relations,
                typedApi,
                workbookId,
            });

            const normalizedDatasets = datasets
                ? keyBy(datasets.result, (dataset) => dataset.dataset_id)
                : {};
            // TODO: wait for back fix
            // const normalizedConnections = connections
            //     ? keyBy(connections.result, (connection) => connection.connection_id)
            //     : {};

            return relations.map((entry) => {
                let lockPublication = false;
                let lockPublicationReason = null;

                if (entry.scope === EntryScope.Dataset) {
                    const datasetEntry = normalizedDatasets[entry.entryId];
                    lockPublication = datasetEntry && !datasetEntry.allowed;
                    lockPublicationReason = datasetEntry.reason;
                }

                // if (entry.scope === EntryScope.Connection) {
                //     const connectionEntry = normalizedConnections[entry.entryId];
                //     lockPublication = connectionEntry && !connectionEntry.allowed;
                //     lockPublicationReason = connectionEntry.reason;
                // }

                return {
                    ...entry,
                    lockPublication,
                    lockPublicationReason,
                };
            });
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

        const [datasets] = await checkEntriesForPublication({
            entries,
            typedApi,
            workbookId,
        });

        let errorMessage = '';

        if (datasets && datasets.result.some((datasetEntry) => !datasetEntry.allowed)) {
            errorMessage += JSON.stringify(
                datasets.result
                    .filter(({allowed}) => !allowed)
                    .map(({dataset_id: entryId, reason}) => ({entryId, reason})),
                null,
                4,
            );
        }

        // if (connections && connections.result.some((connectionEntry) => !connectionEntry.allowed)) {
        //     errorMessage += JSON.stringify(
        //         connections.result
        //             .filter(({allowed}) => !allowed)
        //             .map(({connection_id: entryId, reason}) => ({entryId, reason})),
        //         null,
        //         4,
        //     );
        // }

        if (errorMessage) {
            throw new Error(`Failed to publish entries:\n ${errorMessage}`);
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
                        case 400:
                            if ('code' in error && error.code === 'DECODE_ID_FAILED') {
                                return {code: 'NOT_FOUND'};
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
            return await getTypedApi(api).us.getRelations({
                entryId,
                direction,
            });
        },
    ),
    getBatchEntriesByIds: createAction<GetBatchEntriesByIdsResponse, GetBatchEntriesByIdsArgs>(
        async (api, args) => {
            const typedApi = getTypedApi(api);
            const {ids, ...restArgs} = args;

            if (ids.length === 0) {
                return {
                    entries: [],
                };
            }

            // If we have more than 50 IDs, split them into batches to avoid URL length limitations
            if (ids.length > 50) {
                const batches = [];
                for (let i = 0; i < ids.length; i += 50) {
                    batches.push(ids.slice(i, i + 50));
                }

                const batchResults = await Promise.all(
                    batches.map((batchIds) =>
                        typedApi.us.getEntries({
                            ...restArgs,
                            ids: batchIds,
                        }),
                    ),
                );

                const combinedEntries = batchResults.reduce(
                    (acc, result) => [...acc, ...result.entries],
                    [] as GetEntriesEntryResponse[],
                );

                return {
                    entries: combinedEntries,
                };
            }

            const entriesResponse = await typedApi.us.getEntries(args);

            return {entries: entriesResponse.entries};
        },
    ),
};
