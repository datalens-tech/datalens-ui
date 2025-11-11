import {type EntryScope, EntryUpdateMode} from '../../../..';
import {Dash} from '../../../../../server/components/sdk';
import {createTypedAction} from '../../../gateway-utils';
import {getTypedApi} from '../../../simple-schema';
import {updateDashArgsSchema, updateDashResultSchema} from '../../schemas/dash';
import type {DashV1} from '../../types';

export const updateDashboardV1 = createTypedAction(
    {
        paramsSchema: updateDashArgsSchema,
        resultSchema: updateDashResultSchema,
    },
    async (api, {entryId, mode = EntryUpdateMode.Publish, meta, data, revId, annotation}) => {
        const typedApi = getTypedApi(api);

        const links = Dash.gatherLinks(data);

        Dash.validateData(data);

        const skipSyncLinks = mode !== EntryUpdateMode.Publish;

        const updateEntryResult = await typedApi.us._updateEntry({
            entryId,
            mode,
            meta,
            data,
            revId,
            links,
            annotation,
            skipSyncLinks,
        });

        return {
            entry: {
                version: 1 as const,
                data: updateEntryResult.data as DashV1['data'],
                meta: updateEntryResult.meta as DashV1['meta'],
                scope: updateEntryResult.scope as EntryScope.Dash,
                type: updateEntryResult.type as DashV1['type'],
                entryId: updateEntryResult.entryId,
                key: updateEntryResult.key,
                createdAt: updateEntryResult.createdAt,
                createdBy: updateEntryResult.createdBy,
                updatedAt: updateEntryResult.updatedAt,
                updatedBy: updateEntryResult.updatedBy,
                revId: updateEntryResult.revId,
                savedId: updateEntryResult.savedId,
                publishedId: updateEntryResult.publishedId,
                tenantId: updateEntryResult.tenantId,
                hidden: updateEntryResult.hidden,
                public: updateEntryResult.public,
                workbookId: updateEntryResult.workbookId,
                annotation: updateEntryResult.annotation,
                links: updateEntryResult.links,
            },
        };
    },
);
