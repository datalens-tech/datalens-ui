import z from 'zod';

import {makeSchemaRef} from '../../../utils/openapi';

const BI_SCHEMA_NAME = {
    ConnectionCreate: 'ConnectionCreate',
    ConnectionRead: 'ConnectionRead',
    ConnectionUpdate: 'ConnectionUpdate',
};

export const deleteConnectionArgsSchema = z.object({
    connectionId: z.string(),
});

export const deleteConnectionResultSchema = z.unknown();

export const getConnectionArgsSchema = z.object({
    connectionId: z.string(),
    workbookId: z.string().nullable(),
});

export const getConnectionResultSchema = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.ConnectionRead),
});

export const createConnectionArgsSchema = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.ConnectionCreate),
});

export const createConnectionResultSchema = z.object({
    id: z.string(),
});

export const updateConnectionArgsSchema = z.object({
    connectionId: z.string(),
    data: z.any().meta({
        $ref: makeSchemaRef(BI_SCHEMA_NAME.ConnectionUpdate),
    }),
});

export const updateConnectionResultSchema = z.any().meta({
    $ref: makeSchemaRef(BI_SCHEMA_NAME.ConnectionRead),
});
