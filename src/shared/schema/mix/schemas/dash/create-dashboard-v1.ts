import z from 'zod';

import {dataSchema} from '../../../../zod-schemas/dash';
import {keyOrWorkbookIdNameSchema} from '../../../../zod-schemas/entry';

import {dashSchemaV1} from './dash-v1';

const createDashData = dataSchema.omit({schemeVersion: true});

export const createDashV1ArgsSchema = z.object({
    entry: z
        .object({
            data: createDashData,
            meta: z.record(z.string(), z.string()).nullable(),
            annotation: z
                .object({
                    description: z.string(),
                })
                .optional(),
        })
        .and(keyOrWorkbookIdNameSchema),
});

export const createDashV1ResultSchema = z.object({
    entry: dashSchemaV1,
});
