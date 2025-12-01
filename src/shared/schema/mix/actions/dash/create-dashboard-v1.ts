import type {AppContext} from '@gravity-ui/nodekit';
import Hashids from 'hashids';

import {getTypedApi} from '../../..';
import {EntryScope} from '../../../..';
import {Dash} from '../../../../../server/components/sdk';
import {createTypedAction} from '../../../gateway-utils';
import {
    createDashV1ArgsSchema,
    createDashV1ResultSchema,
} from '../../schemas/dash/create-dashboard-v1';
import {DASH_VERSION_1} from '../../schemas/dash/dash-v1';
import type {CreateDashV1Result, DashV1} from '../../types';

const DEFAULT_COUNTER_VALUE = 2;

const DEFAULT_SETTINGS = {
    autoupdateInterval: null,
    maxConcurrentRequests: null,
    silentLoading: false,
    dependentSelectors: true,
    hideTabs: false,
    hideDashTitle: false,
    expandTOC: false,
};

const getDefaultTabs = ({ctx, salt}: {ctx: AppContext; salt: string}) => {
    const I18n = ctx.get('i18n');
    const i18n = I18n.keyset('dash.tabs-dialog.edit');

    const hashids = new Hashids(salt);

    return [
        {
            id: hashids.encode(1),
            title: i18n('value_default', {index: 1}),
            items: [],
            layout: [],
            aliases: {},
            connections: [],
        },
    ];
};

export const createDashboardV1 = createTypedAction(
    {
        paramsSchema: createDashV1ArgsSchema,
        resultSchema: createDashV1ResultSchema,
    },
    async (api, args, {ctx}): Promise<CreateDashV1Result> => {
        const typedApi = getTypedApi(api);

        const salt = args.data.salt ?? Math.random().toString();

        const data = {
            ...args.data,
            counter: args.data.counter ?? DEFAULT_COUNTER_VALUE,
            salt,
            tabs: args.data.tabs ?? getDefaultTabs({ctx, salt}),
            settings: args.data.settings ?? DEFAULT_SETTINGS,
            schemeVersion: 8,
        };

        const links = Dash.gatherLinks(data);

        Dash.validateData(data);

        const createEntryResult = await typedApi.us._createEntry({
            ...args,
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
