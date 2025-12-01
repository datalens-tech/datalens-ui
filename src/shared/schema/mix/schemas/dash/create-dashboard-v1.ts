import z from 'zod';

import {EntryUpdateMode} from '../../../..';
import {dataSchema} from '../../../../zod-schemas/dash';

import {dashSchemaV1} from './dash-v1';

export const createDashV1ArgsSchema = z.strictObject({
    key: z.string().min(1),
    data: dataSchema,
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

export const createDashV1ResultSchema = z.object({
    entry: dashSchemaV1,
});
