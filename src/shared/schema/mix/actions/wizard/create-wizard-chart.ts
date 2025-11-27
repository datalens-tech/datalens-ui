import z from 'zod';

import {ENTRY_TYPES, EntryScope, EntryUpdateMode} from '../../../..';
import {createTypedAction} from '../../../gateway-utils';
import {getTypedApi} from '../../../simple-schema';

const createWizardChartArgsSchema = z.object({
    type: z.enum(ENTRY_TYPES.wizard),
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

const createWizardChartResultSchema = z.record(z.string(), z.unknown());

export const __createWizardChart__ = createTypedAction(
    {
        paramsSchema: createWizardChartArgsSchema,
        resultSchema: createWizardChartResultSchema,
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
