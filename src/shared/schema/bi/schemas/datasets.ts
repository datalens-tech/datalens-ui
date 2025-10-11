import z from 'zod';

import {makeSchemaRef} from '../../../utils/openapi';

const BI_SCHEMA_NAME = {
    DatasetCreate: 'DatasetCreate',
    DatasetUpdate: 'DatasetUpdate',
    DatasetRead: 'DatasetRead',
    DatasetValidate: 'DatasetValidate',
};

export const createDatasetArgsSchemaApi = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetCreate),
});

export const createDatasetResultSchemaApi = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetRead),
});

export const updateDatasetArgsSchemaApi = z.object({
    version: z.literal('draft'),
    datasetId: z.string(),
    data: z.any().meta({
        $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetUpdate),
    }),
});

export const updateDatasetResultSchemaApi = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetRead),
});

export const deleteDatasetArgsSchema = z.object({
    datasetId: z.string(),
});

export const deleteDatasetResultSchema = z.unknown();

export const getDatasetByVersionArgsSchemaApi = z.object({
    datasetId: z.string(),
    version: z.literal('draft'),
    workbookId: z.union([z.null(), z.string()]),
    rev_id: z.string().optional(),
});

export const getDatasetByVersionResultSchemaApi = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetRead),
});

export const validateDatasetArgsSchemaApi = z.object({
    datasetId: z.string(),
    version: z.literal('draft'),
    workbookId: z.union([z.null(), z.string()]),
    data: z.any().meta({
        $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetValidate),
    }),
});

export const validateDatasetResultSchemaApi = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetRead),
});
