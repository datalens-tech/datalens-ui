import type {ComponentsObject} from '@asteasolutions/zod-to-openapi/dist/types';

export const BI_SCHEMAS: ComponentsObject['schemas'] = {
    CreateDatasetSchema: {
        properties: {
            options: {
                $ref: '#/components/schemas/OptionsSchema',
            },
            dataset: {
                $ref: '#/components/schemas/DatasetContentInternalSchema',
            },
            name: {
                type: 'string',
            },
            dir_path: {
                type: 'string',
            },
            workbook_id: {
                type: 'string',
            },
            preview: {
                type: 'boolean',
            },
            created_via: {
                type: 'string',
            },
        },
        type: 'object',
    },
    OptionsSchema: {
        properties: {
            join: {
                $ref: '#/components/schemas/JoinSchema',
            },
            schema_update_enabled: {
                type: 'boolean',
            },
            data_types: {
                $ref: '#/components/schemas/DataTypesSchema',
            },
            preview: {
                $ref: '#/components/schemas/PreviewSchema',
            },
            fields_: {
                $ref: '#/components/schemas/FieldsSchema',
            },
            connections: {
                $ref: '#/components/schemas/ConnectionsSchema',
            },
            sources: {
                $ref: '#/components/schemas/SourcesSchema',
            },
            source_avatars: {
                $ref: '#/components/schemas/AvatarsSchema',
            },
            supports_offset: {
                type: 'boolean',
            },
            supported_functions: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },
        type: 'object',
    },
    JoinSchema: {
        properties: {
            types: {
                type: 'array',
                items: {
                    type: 'string',
                    example: 'inner',
                    enum: ['inner', 'left', 'right', 'full'],
                },
            },
            operators: {
                type: 'array',
                items: {
                    type: 'string',
                    example: 'gt',
                    enum: ['gt', 'lt', 'gte', 'lte', 'eq', 'ne'],
                },
            },
        },
        type: 'object',
    },
    DataTypesSchema: {
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/DataTypeListItemSchema',
                },
            },
        },
        type: 'object',
    },
    DataTypeListItemSchema: {
        properties: {
            type: {
                type: 'string',
                example: 'string',
                enum: [
                    'string',
                    'integer',
                    'float',
                    'date',
                    'datetime',
                    'boolean',
                    'geopoint',
                    'geopolygon',
                    'uuid',
                    'markup',
                    'datetimetz',
                    'unsupported',
                    'array_str',
                    'array_int',
                    'array_float',
                    'tree_str',
                    'genericdatetime',
                ],
            },
            aggregations: {
                type: 'array',
                items: {
                    type: 'string',
                    example: 'none',
                    enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
                },
            },
            casts: {
                type: 'array',
                items: {
                    type: 'string',
                    example: 'string',
                    enum: [
                        'string',
                        'integer',
                        'float',
                        'date',
                        'datetime',
                        'boolean',
                        'geopoint',
                        'geopolygon',
                        'uuid',
                        'markup',
                        'datetimetz',
                        'unsupported',
                        'array_str',
                        'array_int',
                        'array_float',
                        'tree_str',
                        'genericdatetime',
                    ],
                },
            },
            filter_operations: {
                type: 'array',
                items: {
                    type: 'string',
                    example: 'ISNULL',
                    enum: [
                        'ISNULL',
                        'ISNOTNULL',
                        'GT',
                        'LT',
                        'GTE',
                        'LTE',
                        'EQ',
                        'NE',
                        'STARTSWITH',
                        'ISTARTSWITH',
                        'ENDSWITH',
                        'IENDSWITH',
                        'CONTAINS',
                        'ICONTAINS',
                        'NOTCONTAINS',
                        'NOTICONTAINS',
                        'LENEQ',
                        'LENNE',
                        'LENGT',
                        'LENGTE',
                        'LENLT',
                        'LENLTE',
                        'IN',
                        'NIN',
                        'BETWEEN',
                    ],
                },
            },
        },
        type: 'object',
    },
    PreviewSchema: {
        properties: {
            enabled: {
                type: 'boolean',
            },
        },
        type: 'object',
    },
    FieldsSchema: {
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/FieldListItemSchema',
                },
            },
        },
        type: 'object',
    },
    FieldListItemSchema: {
        properties: {
            guid: {
                type: 'string',
            },
            casts: {
                type: 'array',
                items: {
                    type: 'string',
                    example: 'string',
                    enum: [
                        'string',
                        'integer',
                        'float',
                        'date',
                        'datetime',
                        'boolean',
                        'geopoint',
                        'geopolygon',
                        'uuid',
                        'markup',
                        'datetimetz',
                        'unsupported',
                        'array_str',
                        'array_int',
                        'array_float',
                        'tree_str',
                        'genericdatetime',
                    ],
                },
            },
            aggregations: {
                type: 'array',
                items: {
                    type: 'string',
                    example: 'none',
                    enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
                },
            },
        },
        type: 'object',
    },
    ConnectionsSchema: {
        properties: {
            max: {
                type: 'integer',
            },
            compatible_types: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/CompatConnectionTypeListItemSchema',
                },
            },
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ConnectionListItemSchema',
                },
            },
        },
        type: 'object',
    },
    CompatConnectionTypeListItemSchema: {
        properties: {
            conn_type: {
                type: 'string',
            },
        },
        type: 'object',
    },
    ConnectionListItemSchema: {
        properties: {
            id: {
                type: 'string',
            },
            replacement_types: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/CompatConnectionTypeListItemSchema',
                },
            },
        },
        type: 'object',
    },
    SourcesSchema: {
        properties: {
            max: {
                type: 'integer',
            },
            compatible_types: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/CompatSourceTypeListItemSchema',
                },
            },
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/SourceListItemSchema',
                },
            },
        },
        type: 'object',
    },
    CompatSourceTypeListItemSchema: {
        properties: {
            source_type: {
                type: 'string',
            },
        },
        type: 'object',
    },
    SourceListItemSchema: {
        properties: {
            id: {
                type: 'string',
            },
            schema_update_enabled: {
                type: 'boolean',
            },
        },
        type: 'object',
    },
    AvatarsSchema: {
        properties: {
            max: {
                type: 'integer',
            },
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/SourceListItemSchema',
                },
            },
        },
        type: 'object',
    },
    DatasetContentInternalSchema: {
        properties: {
            description: {
                type: 'string',
            },
            sources: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/DataSourceStrictSchema',
                },
            },
            source_avatars: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/SourceAvatarStrictSchema',
                },
            },
            avatar_relations: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/AvatarRelationSchema',
                },
            },
            result_schema: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ResultSchemaSchema',
                },
            },
            result_schema_aux: {
                $ref: '#/components/schemas/ResultSchemaAuxSchema',
            },
            rls: {
                type: 'string',
            },
            rls2: {
                type: 'string',
            },
            preview_enabled: {
                type: 'boolean',
            },
            component_errors: {
                $ref: '#/components/schemas/ComponentErrorListSchema',
            },
            obligatory_filters: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ObligatoryFilterSchema',
                },
            },
            revision_id: {
                type: 'string',
            },
            load_preview_by_default: {
                type: 'boolean',
            },
            template_enabled: {
                type: 'boolean',
            },
            data_export_forbidden: {
                type: 'boolean',
            },
        },
        type: 'object',
    },
    DataSourceStrictSchema: {
        properties: {},
        type: 'object',
    },
    SourceAvatarStrictSchema: {
        required: ['id', 'managed_by'],
        properties: {
            id: {
                type: 'string',
            },
            source_id: {
                type: 'string',
            },
            title: {
                type: 'string',
            },
            is_root: {
                type: 'boolean',
            },
            managed_by: {
                type: 'string',
                example: 'user',
                enum: ['user', 'feature', 'compiler_runtime'],
            },
            virtual: {
                type: 'string',
            },
            valid: {
                type: 'boolean',
            },
        },
        type: 'object',
    },
    AvatarRelationSchema: {
        required: ['id'],
        properties: {
            id: {
                type: 'string',
            },
            left_avatar_id: {
                type: 'string',
            },
            right_avatar_id: {
                type: 'string',
            },
            conditions: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/JoinConditionSchema',
                },
            },
            join_type: {
                type: 'string',
                example: 'inner',
                enum: ['inner', 'left', 'right', 'full'],
            },
            managed_by: {
                type: 'string',
                example: 'user',
                enum: ['user', 'feature', 'compiler_runtime'],
            },
            virtual: {
                type: 'string',
            },
            required: {
                type: 'boolean',
            },
        },
        type: 'object',
    },
    JoinConditionSchema: {
        required: ['left', 'operator', 'right', 'type'],
        properties: {
            type: {
                type: 'string',
                example: 'binary',
                enum: ['binary'],
            },
            operator: {
                type: 'string',
                example: 'gt',
                enum: ['gt', 'lt', 'gte', 'lte', 'eq', 'ne'],
            },
            left: {
                $ref: '#/components/schemas/ConditionPartGenericSchema',
            },
            right: {
                $ref: '#/components/schemas/ConditionPartGenericSchema',
            },
        },
        type: 'object',
    },
    ConditionPartGenericSchema: {
        properties: {},
        type: 'object',
    },
    ResultSchemaSchema: {
        required: ['title'],
        properties: {
            title: {
                type: 'string',
            },
            guid: {
                type: 'string',
            },
            hidden: {
                type: 'boolean',
            },
            description: {
                type: 'string',
            },
            initial_data_type: {
                type: 'string',
                example: 'string',
                enum: [
                    'string',
                    'integer',
                    'float',
                    'date',
                    'datetime',
                    'boolean',
                    'geopoint',
                    'geopolygon',
                    'uuid',
                    'markup',
                    'datetimetz',
                    'unsupported',
                    'array_str',
                    'array_int',
                    'array_float',
                    'tree_str',
                    'genericdatetime',
                ],
            },
            cast: {
                type: 'string',
                example: 'string',
                enum: [
                    'string',
                    'integer',
                    'float',
                    'date',
                    'datetime',
                    'boolean',
                    'geopoint',
                    'geopolygon',
                    'uuid',
                    'markup',
                    'datetimetz',
                    'unsupported',
                    'array_str',
                    'array_int',
                    'array_float',
                    'tree_str',
                    'genericdatetime',
                ],
            },
            type: {
                type: 'string',
                example: 'DIMENSION',
                enum: ['DIMENSION', 'MEASURE'],
            },
            data_type: {
                type: 'string',
                example: 'string',
                enum: [
                    'string',
                    'integer',
                    'float',
                    'date',
                    'datetime',
                    'boolean',
                    'geopoint',
                    'geopolygon',
                    'uuid',
                    'markup',
                    'datetimetz',
                    'unsupported',
                    'array_str',
                    'array_int',
                    'array_float',
                    'tree_str',
                    'genericdatetime',
                ],
            },
            valid: {
                type: 'boolean',
            },
            ui_settings: {
                type: 'string',
            },
            calc_spec: {
                $ref: '#/components/schemas/CalculationSpecSchema',
            },
            aggregation: {
                type: 'string',
                example: 'none',
                enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
            },
            aggregation_locked: {
                type: 'boolean',
            },
            autoaggregated: {
                type: 'boolean',
            },
            has_auto_aggregation: {
                type: 'boolean',
            },
            lock_aggregation: {
                type: 'boolean',
            },
            managed_by: {
                type: 'string',
                example: 'user',
                enum: ['user', 'feature', 'compiler_runtime'],
            },
            virtual: {
                type: 'string',
            },
        },
        type: 'object',
    },
    CalculationSpecSchema: {
        properties: {},
        type: 'object',
    },
    ResultSchemaAuxSchema: {
        properties: {
            inter_dependencies: {
                $ref: '#/components/schemas/FieldInterDependencyInfoSchema',
            },
        },
        type: 'object',
    },
    FieldInterDependencyInfoSchema: {
        properties: {
            deps: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/FieldInterDependencyItemSchema',
                },
            },
        },
        type: 'object',
    },
    FieldInterDependencyItemSchema: {
        properties: {
            dep_field_id: {
                type: 'string',
            },
            ref_field_ids: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },
        type: 'object',
    },
    ComponentErrorListSchema: {
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ComponentErrorPackSchema',
                },
            },
        },
        type: 'object',
    },
    ComponentErrorPackSchema: {
        properties: {
            id: {
                type: 'string',
            },
            type: {
                type: 'string',
                example: 'data_source',
                enum: [
                    'data_source',
                    'source_avatar',
                    'avatar_relation',
                    'field',
                    'obligatory_filter',
                    'result_schema',
                ],
            },
            errors: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ComponentErrorSchema',
                },
            },
        },
        type: 'object',
    },
    ComponentErrorSchema: {
        properties: {
            message: {
                type: 'string',
            },
            level: {
                type: 'string',
                example: 'error',
                enum: ['error', 'warning'],
            },
            code: {
                type: 'string',
            },
            details: {
                type: 'string',
            },
        },
        type: 'object',
    },
    ObligatoryFilterSchema: {
        required: ['id'],
        properties: {
            id: {
                type: 'string',
            },
            field_guid: {
                type: 'string',
            },
            default_filters: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/WhereSchema',
                },
            },
            managed_by: {
                type: 'string',
                example: 'user',
                enum: ['user', 'feature', 'compiler_runtime'],
            },
            valid: {
                type: 'boolean',
            },
        },
        type: 'object',
    },
    WhereSchema: {
        required: ['column', 'operation', 'values'],
        properties: {
            column: {
                type: 'string',
            },
            operation: {
                type: 'string',
                example: 'ISNULL',
                enum: [
                    'ISNULL',
                    'ISNOTNULL',
                    'GT',
                    'LT',
                    'GTE',
                    'LTE',
                    'EQ',
                    'NE',
                    'STARTSWITH',
                    'ISTARTSWITH',
                    'ENDSWITH',
                    'IENDSWITH',
                    'CONTAINS',
                    'ICONTAINS',
                    'NOTCONTAINS',
                    'NOTICONTAINS',
                    'LENEQ',
                    'LENNE',
                    'LENGT',
                    'LENGTE',
                    'LENLT',
                    'LENLTE',
                    'IN',
                    'NIN',
                    'BETWEEN',
                ],
            },
            values: {
                type: 'array',
                items: {
                    type: 'object',
                },
            },
        },
        type: 'object',
    },
    CreateDatasetResponseSchema: {
        properties: {
            options: {
                $ref: '#/components/schemas/OptionsSchema',
            },
            dataset: {
                $ref: '#/components/schemas/DatasetContentInternalSchema',
            },
            id: {
                type: 'string',
            },
        },
        type: 'object',
    },
    DatasetUpdateSchema: {
        properties: {
            options: {
                $ref: '#/components/schemas/OptionsSchema',
            },
            dataset: {
                $ref: '#/components/schemas/DatasetContentInternalSchema',
            },
        },
        type: 'object',
    },
    DatasetContentSchema: {
        properties: {
            options: {
                $ref: '#/components/schemas/OptionsSchema',
            },
            dataset: {
                $ref: '#/components/schemas/DatasetContentInternalSchema',
            },
        },
        type: 'object',
    },
    GetDatasetVersionResponseSchema: {
        properties: {
            options: {
                $ref: '#/components/schemas/OptionsSchema',
            },
            dataset: {
                $ref: '#/components/schemas/DatasetContentInternalSchema',
            },
            id: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            pub_operation_id: {
                type: 'string',
            },
            row_count: {
                type: 'integer',
            },
            ctime: {
                type: 'string',
                format: 'date-time',
                example: '2018-01-01 00:00:00',
            },
            mtime: {
                type: 'string',
                format: 'date-time',
                example: '2018-01-01 00:00:00',
            },
            is_favorite: {
                type: 'boolean',
            },
            permissions: {
                type: 'string',
            },
            key: {
                type: 'string',
            },
            workbook_id: {
                type: 'string',
            },
        },
        type: 'object',
    },
};
