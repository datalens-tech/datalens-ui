import {getTypedApi} from '../../..';
import {DASH_CURRENT_SCHEME_VERSION, EntryScope} from '../../../..';
import {Dash} from '../../../../../server/components/sdk';
import {createTypedAction} from '../../../gateway-utils';
import {
    createDashV1ArgsSchema,
    createDashV1ResultSchema,
} from '../../schemas/dash/create-dashboard-v1';
import {DASH_VERSION_1} from '../../schemas/dash/dash-v1';
import type {CreateDashV1Result, DashV1} from '../../types';

export const createDashboardV1 = createTypedAction(
    {
        paramsSchema: createDashV1ArgsSchema,
        resultSchema: createDashV1ResultSchema,
    },
    async (api, args): Promise<CreateDashV1Result> => {
        const typedApi = getTypedApi(api);

        const argsEntry = args.entry;
        const argsData = argsEntry.data;

        const data = {
            ...argsData,
            schemeVersion: DASH_CURRENT_SCHEME_VERSION,
        };

        const links = Dash.gatherLinks(data);

        Dash.validateData(data);

        const createEntryResult = await typedApi.us._createEntry({
            key: argsEntry.key,
            meta: argsEntry.meta,
            workbookId: argsEntry.workbookId,
            annotation: argsEntry.annotation,
            mode: args.mode,
            data,
            type: '',
            scope: EntryScope.Dash,
            links,
        });

        return {
            entry: {
                version: DASH_VERSION_1,
                data: createEntryResult.data as DashV1['data'],
                meta: createEntryResult.meta as DashV1['meta'],
                scope: createEntryResult.scope as EntryScope.Dash,
                type: createEntryResult.type as DashV1['type'],
                entryId: createEntryResult.entryId,
                key: createEntryResult.key,
                createdAt: createEntryResult.createdAt,
                createdBy: createEntryResult.createdBy,
                updatedAt: createEntryResult.updatedAt,
                updatedBy: createEntryResult.updatedBy,
                revId: createEntryResult.revId,
                savedId: createEntryResult.savedId,
                publishedId: createEntryResult.publishedId,
                tenantId: createEntryResult.tenantId,
                hidden: createEntryResult.hidden,
                public: createEntryResult.public,
                workbookId: createEntryResult.workbookId,
                annotation: createEntryResult.annotation,
                links: createEntryResult.links,
            },
        };
    },
);
