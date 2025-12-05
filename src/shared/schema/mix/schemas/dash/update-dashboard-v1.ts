import z from 'zod';

import {EntryUpdateMode} from '../../../..';
import {dataSchema} from '../../../../zod-schemas/dash';

import {dashSchemaV1} from './dash-v1';

export const updateDashV1ArgsSchema = z.strictObject({
    entry: z.strictObject({
        entryId: z.string(),
        data: dataSchema,
        meta: z.record(z.string(), z.string()).nullable(),
        revId: z.string().optional(),
        annotation: z
            .object({
                description: z.string(),
            })
            .optional(),
    }),
    mode: z.enum(EntryUpdateMode),
});

export const updateDashV1ResultSchema = z.object({
    entry: dashSchemaV1,
});
