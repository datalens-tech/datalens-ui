import z from 'zod';

import {getTypedApi} from '../../..';
import {ENTRY_TYPES, EntryScope, EntryUpdateMode} from '../../../..';
import {ServerError} from '../../../../constants/error';
import {createTypedAction} from '../../../gateway-utils';

const updateQlChartArgsSchema = z.strictObject({
    key: z.string().min(1),
    workbookId: z.string().optional(),
    data: z.record(z.string(), z.unknown()),
    meta: z.record(z.any(), z.any()),
    entryId: z.string(),
    revId: z.string(),
    mode: z.enum(EntryUpdateMode),
    annotation: z
        .object({
            description: z.string(),
        })
        .optional(),
});

const updateQlChartResultSchema = z.record(z.string(), z.unknown());

export const __updateQlChart__ = createTypedAction(
    {
        paramsSchema: updateQlChartArgsSchema,
        resultSchema: updateQlChartResultSchema,
    },
    async (
        api,
        {entryId, mode = EntryUpdateMode.Publish, meta, data, revId, annotation},
    ): Promise<any> => {
        const typedApi = getTypedApi(api);

        const savedEntry = await typedApi.us.getEntry({entryId});

        if (savedEntry.scope !== EntryScope.Widget || !ENTRY_TYPES.ql.includes(savedEntry.type)) {
            throw new ServerError('Entry not found', {
                status: 404,
            });
        }

        const updateEntryResult = await typedApi.us._updateEntry({
            entryId,
            mode,
            meta,
            data,
            revId,
            annotation,
        });

        return updateEntryResult as any;
    },
);
