import z from 'zod/v4';

import {ConnectorType} from '..';
import {
    DATASET_FIELD_TYPES,
    DATASET_VALUE_CONSTRAINT_TYPE,
    DatasetFieldAggregation,
    DatasetFieldType,
} from '../types/dataset';

// Basic type schemas
const parameterDefaultValueSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);

const datasetRlsSchema = z.record(z.string(), z.string());

// Dataset field aggregation schema
const datasetFieldAggregationSchema = z.enum(DatasetFieldAggregation);

// Dataset field type schema
const datasetFieldTypeSchema = z.enum(DatasetFieldType);

// Dataset field types schema
const datasetFieldTypesSchema = z.enum(DATASET_FIELD_TYPES);

// Dataset field calc mode schema
const datasetFieldCalcModeSchema = z.union([
    z.literal('formula'),
    z.literal('direct'),
    z.literal('parameter'),
]);

// Dataset value constraint schema
const datasetValueConstraintSchema = z.discriminatedUnion('type', [
    z.object({
        type: z.literal(DATASET_VALUE_CONSTRAINT_TYPE.DEFAULT),
    }),
    z.object({
        type: z.literal(DATASET_VALUE_CONSTRAINT_TYPE.NULL),
    }),
    z.object({
        type: z.literal(DATASET_VALUE_CONSTRAINT_TYPE.REGEX),
        pattern: z.string(),
    }),
]);

// Dataset field schema
const datasetFieldSchema = z.object({
    aggregation: datasetFieldAggregationSchema,
    type: datasetFieldTypeSchema,
    calc_mode: datasetFieldCalcModeSchema,
    default_value: parameterDefaultValueSchema,
    initial_data_type: datasetFieldTypesSchema,
    cast: datasetFieldTypesSchema,
    data_type: datasetFieldTypesSchema,
    description: z.string(),
    guid: z.string(),
    title: z.string(),
    managed_by: z.string(),
    source: z.string(),
    avatar_id: z.string(),
    formula: z.string().optional(),
    guid_formula: z.string().optional(),
    has_auto_aggregation: z.boolean(),
    aggregation_locked: z.boolean(),
    lock_aggregation: z.boolean(),
    virtual: z.boolean(),
    valid: z.boolean(),
    hidden: z.boolean(),
    autoaggregated: z.boolean(),
    template_enabled: z.boolean().optional(),
    value_constraint: datasetValueConstraintSchema.optional(),
});

// Dataset component error item schema
const datasetComponentErrorItemSchema = z.object({
    code: z.string(),
    level: z.string(),
    message: z.string(),
    details: z.object({
        db_message: z.string().optional(),
        query: z.string().optional(),
    }),
});

// Dataset component error schema
const datasetComponentErrorSchema = z.object({
    id: z.string(),
    type: z.union([z.literal('data_source'), z.literal('field')]),
    errors: z.array(datasetComponentErrorItemSchema),
});

// Obligatory default filter schema
const obligatoryDefaultFilterSchema = z.object({
    column: z.string(),
    operation: z.string(),
    values: z.array(z.string()),
});

// Obligatory filter schema
const obligatoryFilterSchema = z.object({
    id: z.string(),
    field_guid: z.string(),
    managed_by: z.string(),
    valid: z.boolean(),
    default_filters: z.array(obligatoryDefaultFilterSchema),
});

// Dataset raw schema
const datasetRawSchemaSchema = z.object({
    user_type: z.string(),
    name: z.string(),
    title: z.string(),
    description: z.string(),
    nullable: z.boolean(),
    lock_aggregation: z.boolean(),
    has_auto_aggregation: z.boolean(),
    native_type: z.object({
        name: z.string(),
        conn_type: z.string(),
    }),
});

// Dataset source schema
const datasetSourceSchema = z.object({
    id: z.string(),
    connection_id: z.string(),
    ref_source_id: z.union([z.string(), z.null()]),
    name: z.string(),
    title: z.string(),
    source_type: z.string(),
    managed_by: z.string(),
    parameter_hash: z.string(),
    valid: z.boolean(),
    is_ref: z.boolean(),
    virtual: z.boolean(),
    raw_schema: z.array(datasetRawSchemaSchema),
    group: z.array(z.string()),
    parameters: z.object({
        table_name: z.string(),
        db_version: z.string(),
        db_name: z.union([z.string(), z.null()]),
    }),
});

// Dataset source avatar schema
const datasetSourceAvatarSchema = z.object({
    id: z.string(),
    title: z.string(),
    source_id: z.string(),
    managed_by: z.string(),
    valid: z.boolean(),
    is_root: z.boolean(),
    virtual: z.boolean(),
});

// Dataset avatar relation condition schema
const datasetAvatarRelationConditionSchema = z.object({
    operator: z.string(),
    type: z.string(),
    left: z.object({
        calc_mode: z.string(),
        source: z.union([z.string(), z.null()]),
    }),
    right: z.object({
        calc_mode: z.string(),
        source: z.union([z.string(), z.null()]),
    }),
});

// Dataset avatar relation schema
const datasetAvatarRelationSchema = z.object({
    id: z.string(),
    join_type: z.string(),
    left_avatar_id: z.string(),
    right_avatar_id: z.string(),
    managed_by: z.string(),
    virtual: z.boolean(),
    conditions: z.array(datasetAvatarRelationConditionSchema),
    required: z.boolean(),
});

// Dataset option data type item schema
const datasetOptionDataTypeItemSchema = z.object({
    aggregations: z.array(datasetFieldAggregationSchema),
    casts: z.array(datasetFieldTypesSchema),
    type: z.string(),
    filter_operations: z.array(z.string()),
});

// Dataset option field item schema
const datasetOptionFieldItemSchema = z.object({
    aggregations: z.array(datasetFieldAggregationSchema),
    casts: z.array(datasetFieldTypesSchema),
    guid: z.string(),
});

// Dataset options schema
const datasetOptionsSchema = z.object({
    connections: z.object({
        compatible_types: z.array(z.string()),
        items: z.array(
            z.object({
                id: z.string(),
                replacement_types: z.array(
                    z.object({
                        conn_type: z.enum(ConnectorType),
                    }),
                ),
            }),
        ),
        max: z.number(),
    }),
    syntax_highlighting_url: z.string(),
    sources: z.object({
        compatible_types: z.array(z.string()),
        items: z.array(
            z.object({
                schema_update_enabled: z.boolean(),
                id: z.string(),
            }),
        ),
    }),
    preview: z.object({
        enabled: z.boolean(),
    }),
    source_avatars: z.object({
        items: z.array(
            z.object({
                schema_update_enabled: z.boolean(),
                id: z.string(),
            }),
        ),
        max: z.number(),
    }),
    schema_update_enabled: z.boolean(),
    supports_offset: z.boolean(),
    supported_functions: z.array(z.string()),
    data_types: z.object({
        items: z.array(datasetOptionDataTypeItemSchema),
    }),
    fields: z.object({
        items: z.array(datasetOptionFieldItemSchema),
    }),
    join: z.object({
        types: z.array(z.string()),
        operators: z.array(z.string()),
    }),
});

const datasetBodySchema = z.object({
    avatar_relations: z.array(datasetAvatarRelationSchema),
    component_errors: z.object({
        items: z.array(datasetComponentErrorSchema),
    }),
    obligatory_filters: z.array(obligatoryFilterSchema),
    preview_enabled: z.boolean(),
    result_schema: z.array(datasetFieldSchema),
    result_schema_aux: z.object({
        inter_dependencies: z.object({
            deps: z.array(z.string()),
        }),
    }),
    rls: datasetRlsSchema,
    rls2: z.array(z.unknown()),
    source_avatars: z.array(datasetSourceAvatarSchema),
    source_features: z.record(z.string(), z.any()),
    sources: z.array(datasetSourceSchema),
    revisionId: z.string(),
    load_preview_by_default: z.boolean(),
    template_enabled: z.boolean(),
    data_export_forbidden: z.boolean().optional(),
});

// Main Dataset schema
const datasetSchema = z.object({
    id: z.string(),
    realName: z.string(),
    is_favorite: z.boolean(),
    key: z.string(),
    options: datasetOptionsSchema,
    dataset: datasetBodySchema,
    workbook_id: z.string().optional(),
    permissions: z.any().optional(), // Using z.any() for Permissions type as it's complex

    // Backward compatibility fields
    avatar_relations: z.array(datasetAvatarRelationSchema),
    component_errors: z.object({
        items: z.array(datasetComponentErrorSchema),
    }),
    preview_enabled: z.boolean(),
    raw_schema: z.array(datasetRawSchemaSchema).optional(),
    result_schema: z.array(datasetFieldSchema).optional(),
    rls: datasetRlsSchema,
    source_avatars: z.array(datasetSourceAvatarSchema),
    source_features: z.record(z.string(), z.any()),
    sources: z.array(datasetSourceSchema),
});

export {datasetBodySchema, datasetOptionsSchema, datasetSchema};
