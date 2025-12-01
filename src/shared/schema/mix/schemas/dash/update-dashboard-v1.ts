import z from 'zod';

import {EntryUpdateMode} from '../../../..';
import {dataSchema} from '../../../../zod-schemas/dash';

import {dashSchemaV1} from './dash-v1';

export const updateDashV1ArgsSchema = z.strictObject({
    key: z.string().min(1),
    workbookId: z.string().optional(),
    data: dataSchema,
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

export const updateDashV1ResultSchema = z.object({
    entry: dashSchemaV1,
});
