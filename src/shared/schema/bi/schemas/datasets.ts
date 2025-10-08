import z from 'zod';

import {makeSchemaRef} from '../../../utils/openapi';

const BI_SCHEMA_NAME = {
    CreateDatasetSchema: 'CreateDatasetSchema',
    CreateDatasetResponseSchema: 'CreateDatasetResponseSchema',
    DatasetUpdateSchema: 'DatasetUpdateSchema',
    DatasetContentSchema: 'DatasetContentSchema',
    GetDatasetVersionResponseSchema: 'GetDatasetVersionResponseSchema',
};

export const createDatasetArgsSchemaApi = z.object({
    data: z.any().meta({
        $ref: makeSchemaRef(BI_SCHEMA_NAME.CreateDatasetSchema),
    }),
});

export const createDatasetResultSchemaApi = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.CreateDatasetResponseSchema),
});

export const updateDatasetArgsSchemaApi = z.object({
    version: z.literal('draft'),
    datasetId: z.string(),
    data: z.any().meta({
        $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetUpdateSchema),
    }),
});

export const updateDatasetResultSchemaApi = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.DatasetContentSchema),
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
    $ref: makeSchemaRef(BI_SCHEMA_NAME.GetDatasetVersionResponseSchema),
});
