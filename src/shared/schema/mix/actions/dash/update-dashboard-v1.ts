import {getTypedApi} from '../../..';
import {EntryScope, EntryUpdateMode} from '../../../..';
import {Dash} from '../../../../../server/components/sdk';
import {ServerError} from '../../../../constants/error';
import {createTypedAction} from '../../../gateway-utils';
import {
    updateDashV1ArgsSchema,
    updateDashV1ResultSchema,
} from '../../schemas/dash/update-dashboard-v1';
import type {DashV1, UpdateDashV1Result} from '../../types';

const CURRENT_DASH_VERSION = 1 as const;

export const updateDashboardV1 = createTypedAction(
    {
        paramsSchema: updateDashV1ArgsSchema,
        resultSchema: updateDashV1ResultSchema,
    },
    async (
        api,
        {entryId, mode = EntryUpdateMode.Publish, meta, data, revId, annotation},
    ): Promise<UpdateDashV1Result> => {
        const typedApi = getTypedApi(api);

        const savedEntry = await typedApi.us.getEntry({entryId});

        if (savedEntry.scope !== EntryScope.Dash) {
            throw new ServerError('Entry not found', {
                status: 404,
            });
        }

        if (savedEntry.version && savedEntry.version > CURRENT_DASH_VERSION) {
            throw new ServerError(
                `The entry was created or updated using a newer API version and cannot be modified through this API version. 
                Entry version is: ${savedEntry.version}`,
                {
                    status: 409,
                },
            );
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
                version: CURRENT_DASH_VERSION,
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
