import z from 'zod';

import {makeSchemaRef} from '../../../utils/openapi';

const BI_SCHEMA_NAME = {
    DatasetCreate: 'DatasetCreate',
    DatasetUpdate: 'DatasetUpdate',
    DatasetRead: 'DatasetRead',
    DatasetValidate: 'DatasetValidate',
};

export const createDatasetArgsSchema = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetCreate),
});

export const createDatasetResultSchema = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetRead),
});

export const updateDatasetArgsSchema = z.object({
    version: z.literal('draft'),
    datasetId: z.string(),
    data: z.any().meta({
        $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetUpdate),
    }),
});

export const updateDatasetResultSchema = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetRead),
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

export const getDatasetByVersionResultSchema = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetRead),
});

export const validateDatasetArgsSchema = z.object({
    datasetId: z.string(),
    version: z.literal('draft'),
    workbookId: z.union([z.null(), z.string()]),
    data: z.any().meta({
        $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetValidate),
    }),
});

export const validateDatasetResultSchema = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetRead),
});
