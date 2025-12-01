import {getTypedApi} from '../../..';
import {EntryScope} from '../../../..';
import {Dash} from '../../../../../server/components/sdk';
import {createTypedAction} from '../../../gateway-utils';
import {createDashArgsSchema, createDashResultSchema} from '../../schemas/dash';
import type {DashV1} from '../../types';

export const createDashboardV1 = createTypedAction(
    {
        paramsSchema: createDashArgsSchema,
        resultSchema: createDashResultSchema,
    },
    async (api, args): Promise<any> => {
        const typedApi = getTypedApi(api);

        const links = Dash.gatherLinks(args.data);

        Dash.validateData(args.data);

        const createEntryResult = await typedApi.us._createEntry({
            ...args,
            type: '',
            scope: EntryScope.Dash,
            links,
        });

        return {
            entry: {
                version: 1 as const,
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
