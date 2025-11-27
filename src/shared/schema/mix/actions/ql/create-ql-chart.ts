import z from 'zod';

import {ENTRY_TYPES, EntryScope, EntryUpdateMode} from '../../../..';
import {createTypedAction} from '../../../gateway-utils';
import {getTypedApi} from '../../../simple-schema';

const createQlChartArgsSchema = z.object({
    type: z.enum(ENTRY_TYPES.ql),
    key: z.string().min(1),
    data: z.record(z.string(), z.unknown()),
    meta: z.record(z.string(), z.string()),
    workbookId: z.string().optional(),
    lockToken: z.string().optional(),
    mode: z.enum(EntryUpdateMode),
    annotation: z
        .object({
            description: z.string(),
        })
        .optional(),
});

const createQlChartResultSchema = z.record(z.string(), z.unknown());

export const __createQlChart__ = createTypedAction(
    {
        paramsSchema: createQlChartArgsSchema,
        resultSchema: createQlChartResultSchema,
    },
    async (api, args) => {
        const typedApi = getTypedApi(api);

        const createEntryResult = await typedApi.us._createEntry({
            ...args,
            scope: EntryScope.Widget,
        });

        return createEntryResult as any;
    },
);
