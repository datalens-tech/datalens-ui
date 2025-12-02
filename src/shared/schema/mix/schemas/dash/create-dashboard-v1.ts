import z from 'zod';

import {EntryUpdateMode} from '../../../..';
import {dataSchema} from '../../../../zod-schemas/dash';

import {dashSchemaV1} from './dash-v1';

const createDashData = dataSchema
    .partial({tabs: true, salt: true, settings: true})
    .omit({schemeVersion: true, counter: true});

export const createDashV1ArgsSchema = z.strictObject({
    entry: z.strictObject({
        key: z.string().min(1),
        data: createDashData,
        meta: z.record(z.string(), z.string()),
        workbookId: z.string().optional(),
        annotation: z
            .object({
                description: z.string(),
            })
            .optional(),
    }),
    mode: z.enum(EntryUpdateMode),
});

export const createDashV1ResultSchema = z.object({
    entry: dashSchemaV1,
});
