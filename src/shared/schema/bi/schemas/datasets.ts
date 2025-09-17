import z from 'zod/v4';

import {datasetBodySchema, datasetOptionsSchema, datasetSchema} from '../../../zod-schemas/dataset';

const createDatasetDefaultArgsSchema = z.object({
    name: z.string(),
    created_via: z.string().optional(),
    multisource: z.boolean(),
    dataset: datasetBodySchema,
});

export const createDatasetArgsSchema = z.union([
    z.object({...createDatasetDefaultArgsSchema.shape, dir_path: z.string()}),
    z.object({...createDatasetDefaultArgsSchema.shape, workbook_id: z.string()}),
]);

export const createDatasetResultSchema = z.object({
    id: z.string(),
    dataset: datasetBodySchema,
    options: datasetOptionsSchema,
});

export const updateDatasetArgsSchema = z.object({
    version: z.literal('draft'),
    datasetId: z.string(),
    multisource: z.boolean(),
    dataset: datasetBodySchema,
});

export const updateDatasetResultSchema = z.object({
    id: z.string(),
    dataset: datasetBodySchema,
    options: datasetOptionsSchema,
});

export const deleteDatasetArgsSchema = z.object({
    datasetId: z.string(),
});

export const deleteDatasetResultSchema = z.unknown();

export const getDatasetByVersionArgsSchema = z.object({
    datasetId: z.string(),
    version: z.literal('draft'),
    workbookId: z.union([z.null(), z.string()]),
    rev_id: z.string().optional(),
});

export const getDatasetByVersionResultSchema = datasetSchema;
