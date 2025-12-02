import {getTypedApi} from '../../..';
import {EntryScope, EntryUpdateMode} from '../../../..';
import {Dash} from '../../../../../server/components/sdk';
import {ServerError} from '../../../../constants/error';
import {createTypedAction} from '../../../gateway-utils';
import {DASH_VERSION_1} from '../../schemas/dash/dash-v1';
import {
    updateDashV1ArgsSchema,
    updateDashV1ResultSchema,
} from '../../schemas/dash/update-dashboard-v1';
import type {DashV1, UpdateDashV1Result} from '../../types';

export const updateDashboardV1 = createTypedAction(
    {
        paramsSchema: updateDashV1ArgsSchema,
        resultSchema: updateDashV1ResultSchema,
    },
    async (
        api,
        {mode = EntryUpdateMode.Publish, entry: {entryId, meta, data, revId, annotation}},
    ): Promise<UpdateDashV1Result> => {
        const typedApi = getTypedApi(api);

        const {entry: savedDash} = await typedApi.mix.getDashboardV1({dashboardId: entryId});

        if (savedDash.scope !== EntryScope.Dash) {
            throw new ServerError('Entry not found', {
                status: 404,
            });
        }

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
                version: DASH_VERSION_1,
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
