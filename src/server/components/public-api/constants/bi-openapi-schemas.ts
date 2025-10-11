export const BI_OPENAPI_SCHEMAS: any = {
    appmetrica_api: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            counter_id: {
                type: 'string',
            },
            dir_path: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            accuracy: {
                type: ['number', 'null'],
                default: null,
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            token: {
                type: 'string',
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'appmetrica_api',
            },
        },
        required: ['counter_id', 'name', 'token', 'dir_path'],
        additionalProperties: false,
        title: 'appmetrica_api',
    },
    ch_over_yt: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            additional_cluster: {
                type: 'string',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            token: {
                type: 'string',
                writeOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            alias: {
                type: 'string',
            },
            cluster: {
                type: 'string',
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'ch_over_yt',
            },
        },
        required: ['alias', 'cluster', 'name', 'token', 'dir_path'],
        additionalProperties: false,
        title: 'ch_over_yt',
    },
    ch_over_yt_user_auth: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            name: {
                type: 'string',
            },
            alias: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            additional_cluster: {
                type: 'string',
            },
            cluster: {
                type: 'string',
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'ch_over_yt_user_auth',
            },
        },
        required: ['alias', 'cluster', 'name', 'dir_path'],
        additionalProperties: false,
        title: 'ch_over_yt_user_auth',
    },
    clickhouse: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            connection_manager_folder_id: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            readonly: {
                type: 'integer',
                default: 2,
            },
            data_export_forbidden: {
                default: 'off',
            },
            connection_manager_cloud_id: {
                type: ['string', 'null'],
            },
            connection_manager_connection_id: {
                type: ['string', 'null'],
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            secure: {},
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            connection_manager_delegation_is_set: {
                type: ['boolean', 'null'],
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'clickhouse',
            },
        },
        required: ['host', 'name', 'port', 'dir_path'],
        additionalProperties: false,
        title: 'clickhouse',
    },
    RawSchemaColumn: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
            user_type: {
                type: 'string',
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
            title: {
                type: 'string',
            },
        },
        additionalProperties: false,
    },
    FileSourceColumnType: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
            user_type: {
                type: 'string',
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
        additionalProperties: false,
    },
    FileSource: {
        type: 'object',
        properties: {
            file_id: {
                type: ['string', 'null'],
                default: null,
            },
            id: {
                type: 'string',
            },
            status: {
                readOnly: true,
                type: 'string',
                enum: ['in_progress', 'ready', 'failed', 'expired'],
            },
            title: {
                type: 'string',
            },
            preview: {
                type: 'array',
                readOnly: true,
                items: {
                    type: 'array',
                    items: {},
                },
            },
            raw_schema: {
                readOnly: true,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn',
                },
            },
            column_types: {
                writeOnly: true,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/FileSourceColumnType',
                },
            },
        },
        additionalProperties: false,
    },
    ComponentError: {
        type: 'object',
        properties: {
            message: {
                type: 'string',
            },
            code: {},
            details: {
                type: 'object',
                additionalProperties: {},
            },
            level: {
                type: 'string',
                enum: ['error', 'warning'],
            },
        },
    },
    ComponentErrorPack: {
        type: 'object',
        properties: {
            errors: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ComponentError',
                },
            },
            type: {
                type: 'string',
                enum: [
                    'data_source',
                    'source_avatar',
                    'avatar_relation',
                    'field',
                    'obligatory_filter',
                    'result_schema',
                ],
            },
            id: {
                type: 'string',
            },
        },
    },
    ComponentErrorList: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ComponentErrorPack',
                },
            },
        },
    },
    ReplaceFileSource: {
        type: 'object',
        properties: {
            new_source_id: {
                type: 'string',
            },
            old_source_id: {
                type: 'string',
            },
        },
        additionalProperties: false,
    },
    file: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            sources: {
                minItems: 1,
                maxItems: 10,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/FileSource',
                },
            },
            dir_path: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            data_export_forbidden: {
                default: 'off',
            },
            component_errors: {
                $ref: '#/components/schemas/ComponentErrorList',
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            replace_sources: {
                default: [],
                writeOnly: true,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ReplaceFileSource',
                },
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'file',
            },
        },
        required: ['name', 'dir_path'],
        additionalProperties: false,
        title: 'file',
    },
    greenplum: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            enforce_collate: {
                default: 'auto',
                type: 'string',
                enum: ['auto', 'on', 'off'],
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: 'string',
                writeOnly: true,
            },
            username: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'greenplum',
            },
        },
        required: ['host', 'name', 'password', 'port', 'username', 'dir_path'],
        additionalProperties: false,
        title: 'greenplum',
    },
    gsheets: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            name: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            url: {
                type: 'string',
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'gsheets',
            },
        },
        required: ['name', 'url', 'dir_path'],
        additionalProperties: false,
        title: 'gsheets',
    },
    json_api: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            allowed_methods: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['GET', 'POST'],
                },
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            plain_headers: {
                type: ['object', 'null'],
                additionalProperties: {
                    type: ['string', 'null'],
                },
            },
            path: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            secret_headers: {
                type: ['object', 'null'],
                additionalProperties: {
                    type: ['string', 'null'],
                },
            },
            tvm_dst_id: {
                type: ['integer', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            secure: {
                type: 'boolean',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'json_api',
            },
        },
        required: ['allowed_methods', 'host', 'name', 'port', 'dir_path'],
        additionalProperties: false,
        title: 'json_api',
    },
    metrika_api: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            counter_id: {
                type: 'string',
            },
            dir_path: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            accuracy: {
                type: ['number', 'null'],
                default: null,
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            token: {
                type: 'string',
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'metrika_api',
            },
        },
        required: ['counter_id', 'name', 'token', 'dir_path'],
        additionalProperties: false,
        title: 'metrika_api',
    },
    mssql: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: 'string',
                writeOnly: true,
            },
            username: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'mssql',
            },
        },
        required: ['host', 'name', 'password', 'port', 'username', 'dir_path'],
        additionalProperties: false,
        title: 'mssql',
    },
    mysql: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            connection_manager_folder_id: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            connection_manager_cloud_id: {
                type: ['string', 'null'],
            },
            connection_manager_connection_id: {
                type: ['string', 'null'],
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            connection_manager_delegation_is_set: {
                type: ['boolean', 'null'],
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'mysql',
            },
        },
        required: ['host', 'name', 'port', 'dir_path'],
        additionalProperties: false,
        title: 'mysql',
    },
    oracle: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: 'string',
                writeOnly: true,
            },
            username: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            db_connect_method: {
                type: 'string',
                enum: ['sid', 'service_name'],
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'oracle',
            },
        },
        required: ['db_connect_method', 'host', 'name', 'password', 'port', 'username', 'dir_path'],
        additionalProperties: false,
        title: 'oracle',
    },
    postgres: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            connection_manager_folder_id: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            connection_manager_cloud_id: {
                type: ['string', 'null'],
            },
            connection_manager_connection_id: {
                type: ['string', 'null'],
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            enforce_collate: {
                default: 'auto',
                type: 'string',
                enum: ['auto', 'on', 'off'],
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            connection_manager_delegation_is_set: {
                type: ['boolean', 'null'],
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'postgres',
            },
        },
        required: ['host', 'name', 'port', 'dir_path'],
        additionalProperties: false,
        title: 'postgres',
    },
    promql: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            path: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            secure: {
                type: 'boolean',
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'promql',
            },
        },
        required: ['host', 'name', 'port', 'dir_path'],
        additionalProperties: false,
        title: 'promql',
    },
    solomon: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            host: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'solomon',
            },
        },
        required: ['host', 'name', 'dir_path'],
        additionalProperties: false,
        title: 'solomon',
    },
    usage_tracking_ya_team: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'usage_tracking_ya_team',
            },
        },
        required: ['name', 'dir_path'],
        additionalProperties: false,
        title: 'usage_tracking_ya_team',
    },
    YaDocsFileSource: {
        type: 'object',
        properties: {
            file_id: {
                type: ['string', 'null'],
                default: null,
            },
            id: {
                type: 'string',
            },
            public_link: {
                type: 'string',
                readOnly: true,
            },
            status: {
                readOnly: true,
                type: 'string',
                enum: ['in_progress', 'ready', 'failed', 'expired'],
            },
            title: {
                type: 'string',
            },
            preview: {
                type: 'array',
                readOnly: true,
                items: {
                    type: 'array',
                    items: {},
                },
            },
            raw_schema: {
                readOnly: true,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn',
                },
            },
            sheet_id: {
                type: 'string',
                readOnly: true,
            },
            private_path: {
                type: 'string',
                readOnly: true,
            },
            first_line_is_header: {
                type: 'boolean',
                readOnly: true,
            },
        },
        additionalProperties: false,
    },
    yadocs: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            sources: {
                minItems: 1,
                maxItems: 10,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/YaDocsFileSource',
                },
            },
            dir_path: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            data_export_forbidden: {
                default: 'off',
            },
            component_errors: {
                $ref: '#/components/schemas/ComponentErrorList',
            },
            oauth_token: {
                type: ['string', 'null'],
                default: null,
                writeOnly: true,
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            replace_sources: {
                default: [],
                writeOnly: true,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ReplaceFileSource',
                },
            },
            refresh_enabled: {
                type: 'boolean',
            },
            authorized: {
                type: 'boolean',
                readOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'yadocs',
            },
        },
        required: ['name', 'dir_path'],
        additionalProperties: false,
        title: 'yadocs',
    },
    ydb: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            token: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            port: {
                type: 'integer',
            },
            auth_type: {
                type: ['string', 'null'],
                enum: ['anonymous', 'password', 'oauth', null],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            dir_path: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: 'string',
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'ydb',
            },
        },
        required: ['db_name', 'host', 'name', 'port', 'dir_path'],
        additionalProperties: false,
        title: 'ydb',
    },
    ConnectionCreate: {
        type: 'object',
        properties: {},
        additionalProperties: false,
        oneOf: [
            {
                $ref: '#/components/schemas/appmetrica_api',
            },
            {
                $ref: '#/components/schemas/ch_over_yt',
            },
            {
                $ref: '#/components/schemas/ch_over_yt_user_auth',
            },
            {
                $ref: '#/components/schemas/clickhouse',
            },
            {
                $ref: '#/components/schemas/file',
            },
            {
                $ref: '#/components/schemas/greenplum',
            },
            {
                $ref: '#/components/schemas/gsheets',
            },
            {
                $ref: '#/components/schemas/json_api',
            },
            {
                $ref: '#/components/schemas/metrika_api',
            },
            {
                $ref: '#/components/schemas/mssql',
            },
            {
                $ref: '#/components/schemas/mysql',
            },
            {
                $ref: '#/components/schemas/oracle',
            },
            {
                $ref: '#/components/schemas/postgres',
            },
            {
                $ref: '#/components/schemas/promql',
            },
            {
                $ref: '#/components/schemas/solomon',
            },
            {
                $ref: '#/components/schemas/usage_tracking_ya_team',
            },
            {
                $ref: '#/components/schemas/yadocs',
            },
            {
                $ref: '#/components/schemas/ydb',
            },
        ],
        discriminator: {
            propertyName: 'type',
            mapping: {
                appmetrica_api: '#/components/schemas/appmetrica_api',
                ch_over_yt: '#/components/schemas/ch_over_yt',
                ch_over_yt_user_auth: '#/components/schemas/ch_over_yt_user_auth',
                clickhouse: '#/components/schemas/clickhouse',
                file: '#/components/schemas/file',
                greenplum: '#/components/schemas/greenplum',
                gsheets: '#/components/schemas/gsheets',
                json_api: '#/components/schemas/json_api',
                metrika_api: '#/components/schemas/metrika_api',
                mssql: '#/components/schemas/mssql',
                mysql: '#/components/schemas/mysql',
                oracle: '#/components/schemas/oracle',
                postgres: '#/components/schemas/postgres',
                promql: '#/components/schemas/promql',
                solomon: '#/components/schemas/solomon',
                usage_tracking_ya_team: '#/components/schemas/usage_tracking_ya_team',
                yadocs: '#/components/schemas/yadocs',
                ydb: '#/components/schemas/ydb',
            },
        },
    },
    appmetrica_api1: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            counter_id: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            accuracy: {
                type: ['number', 'null'],
                default: null,
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            token: {
                type: 'string',
                writeOnly: true,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'appmetrica_api',
            },
        },
        required: ['counter_id', 'name', 'token'],
        additionalProperties: false,
        title: 'appmetrica_api',
    },
    ch_over_yt1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            additional_cluster: {
                type: 'string',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            token: {
                type: 'string',
                writeOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            alias: {
                type: 'string',
            },
            cluster: {
                type: 'string',
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'ch_over_yt',
            },
        },
        required: ['alias', 'cluster', 'name', 'token'],
        additionalProperties: false,
        title: 'ch_over_yt',
    },
    ch_over_yt_user_auth1: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            name: {
                type: 'string',
            },
            alias: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            additional_cluster: {
                type: 'string',
            },
            cluster: {
                type: 'string',
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'ch_over_yt_user_auth',
            },
        },
        required: ['alias', 'cluster', 'name'],
        additionalProperties: false,
        title: 'ch_over_yt_user_auth',
    },
    clickhouse1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            connection_manager_folder_id: {
                type: ['string', 'null'],
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            readonly: {
                type: 'integer',
                default: 2,
            },
            data_export_forbidden: {
                default: 'off',
            },
            connection_manager_cloud_id: {
                type: ['string', 'null'],
            },
            connection_manager_connection_id: {
                type: ['string', 'null'],
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            secure: {},
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            connection_manager_delegation_is_set: {
                type: ['boolean', 'null'],
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'clickhouse',
            },
        },
        required: ['host', 'name', 'port'],
        additionalProperties: false,
        title: 'clickhouse',
    },
    file1: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            sources: {
                minItems: 1,
                maxItems: 10,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/FileSource',
                },
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            data_export_forbidden: {
                default: 'off',
            },
            component_errors: {
                $ref: '#/components/schemas/ComponentErrorList',
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            replace_sources: {
                default: [],
                writeOnly: true,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ReplaceFileSource',
                },
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'file',
            },
        },
        required: ['name'],
        additionalProperties: false,
        title: 'file',
    },
    greenplum1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            enforce_collate: {
                default: 'auto',
                type: 'string',
                enum: ['auto', 'on', 'off'],
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: 'string',
                writeOnly: true,
            },
            username: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'greenplum',
            },
        },
        required: ['host', 'name', 'password', 'port', 'username'],
        additionalProperties: false,
        title: 'greenplum',
    },
    gsheets1: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            name: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            url: {
                type: 'string',
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'gsheets',
            },
        },
        required: ['name', 'url'],
        additionalProperties: false,
        title: 'gsheets',
    },
    json_api1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            allowed_methods: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['GET', 'POST'],
                },
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            plain_headers: {
                type: ['object', 'null'],
                additionalProperties: {
                    type: ['string', 'null'],
                },
            },
            path: {
                type: ['string', 'null'],
            },
            secret_headers: {
                type: ['object', 'null'],
                additionalProperties: {
                    type: ['string', 'null'],
                },
            },
            tvm_dst_id: {
                type: ['integer', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            secure: {
                type: 'boolean',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'json_api',
            },
        },
        required: ['allowed_methods', 'host', 'name', 'port'],
        additionalProperties: false,
        title: 'json_api',
    },
    metrika_api1: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            counter_id: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            accuracy: {
                type: ['number', 'null'],
                default: null,
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            token: {
                type: 'string',
                writeOnly: true,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'metrika_api',
            },
        },
        required: ['counter_id', 'name', 'token'],
        additionalProperties: false,
        title: 'metrika_api',
    },
    mssql1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: 'string',
                writeOnly: true,
            },
            username: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'mssql',
            },
        },
        required: ['host', 'name', 'password', 'port', 'username'],
        additionalProperties: false,
        title: 'mssql',
    },
    mysql1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            connection_manager_folder_id: {
                type: ['string', 'null'],
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            connection_manager_cloud_id: {
                type: ['string', 'null'],
            },
            connection_manager_connection_id: {
                type: ['string', 'null'],
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            connection_manager_delegation_is_set: {
                type: ['boolean', 'null'],
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'mysql',
            },
        },
        required: ['host', 'name', 'port'],
        additionalProperties: false,
        title: 'mysql',
    },
    oracle1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: 'string',
                writeOnly: true,
            },
            username: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            db_connect_method: {
                type: 'string',
                enum: ['sid', 'service_name'],
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'oracle',
            },
        },
        required: ['db_connect_method', 'host', 'name', 'password', 'port', 'username'],
        additionalProperties: false,
        title: 'oracle',
    },
    postgres1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            connection_manager_folder_id: {
                type: ['string', 'null'],
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            connection_manager_cloud_id: {
                type: ['string', 'null'],
            },
            connection_manager_connection_id: {
                type: ['string', 'null'],
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            enforce_collate: {
                default: 'auto',
                type: 'string',
                enum: ['auto', 'on', 'off'],
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            connection_manager_delegation_is_set: {
                type: ['boolean', 'null'],
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'postgres',
            },
        },
        required: ['host', 'name', 'port'],
        additionalProperties: false,
        title: 'postgres',
    },
    promql1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            path: {
                type: ['string', 'null'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            secure: {
                type: 'boolean',
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: ['string', 'null'],
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'promql',
            },
        },
        required: ['host', 'name', 'port'],
        additionalProperties: false,
        title: 'promql',
    },
    solomon1: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            host: {
                type: 'string',
            },
            name: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'solomon',
            },
        },
        required: ['host', 'name'],
        additionalProperties: false,
        title: 'solomon',
    },
    usage_tracking_ya_team1: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'usage_tracking_ya_team',
            },
        },
        required: ['name'],
        additionalProperties: false,
        title: 'usage_tracking_ya_team',
    },
    yadocs1: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            sources: {
                minItems: 1,
                maxItems: 10,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/YaDocsFileSource',
                },
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            data_export_forbidden: {
                default: 'off',
            },
            component_errors: {
                $ref: '#/components/schemas/ComponentErrorList',
            },
            oauth_token: {
                type: ['string', 'null'],
                default: null,
                writeOnly: true,
            },
            name: {
                type: 'string',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            replace_sources: {
                default: [],
                writeOnly: true,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ReplaceFileSource',
                },
            },
            refresh_enabled: {
                type: 'boolean',
            },
            authorized: {
                type: 'boolean',
                readOnly: true,
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'yadocs',
            },
        },
        required: ['name'],
        additionalProperties: false,
        title: 'yadocs',
    },
    ydb1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            token: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            port: {
                type: 'integer',
            },
            auth_type: {
                type: ['string', 'null'],
                enum: ['anonymous', 'password', 'oauth', null],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            name: {
                type: 'string',
            },
            db_name: {
                type: 'string',
            },
            type: {
                readOnly: false,
                type: 'string',
                const: 'ydb',
            },
        },
        required: ['db_name', 'host', 'name', 'port'],
        additionalProperties: false,
        title: 'ydb',
    },
    ConnectionRead: {
        type: 'object',
        properties: {},
        additionalProperties: false,
        oneOf: [
            {
                $ref: '#/components/schemas/appmetrica_api1',
            },
            {
                $ref: '#/components/schemas/ch_over_yt1',
            },
            {
                $ref: '#/components/schemas/ch_over_yt_user_auth1',
            },
            {
                $ref: '#/components/schemas/clickhouse1',
            },
            {
                $ref: '#/components/schemas/file1',
            },
            {
                $ref: '#/components/schemas/greenplum1',
            },
            {
                $ref: '#/components/schemas/gsheets1',
            },
            {
                $ref: '#/components/schemas/json_api1',
            },
            {
                $ref: '#/components/schemas/metrika_api1',
            },
            {
                $ref: '#/components/schemas/mssql1',
            },
            {
                $ref: '#/components/schemas/mysql1',
            },
            {
                $ref: '#/components/schemas/oracle1',
            },
            {
                $ref: '#/components/schemas/postgres1',
            },
            {
                $ref: '#/components/schemas/promql1',
            },
            {
                $ref: '#/components/schemas/solomon1',
            },
            {
                $ref: '#/components/schemas/usage_tracking_ya_team1',
            },
            {
                $ref: '#/components/schemas/yadocs1',
            },
            {
                $ref: '#/components/schemas/ydb1',
            },
        ],
        discriminator: {
            propertyName: 'type',
            mapping: {
                appmetrica_api: '#/components/schemas/appmetrica_api1',
                ch_over_yt: '#/components/schemas/ch_over_yt1',
                ch_over_yt_user_auth: '#/components/schemas/ch_over_yt_user_auth1',
                clickhouse: '#/components/schemas/clickhouse1',
                file: '#/components/schemas/file1',
                greenplum: '#/components/schemas/greenplum1',
                gsheets: '#/components/schemas/gsheets1',
                json_api: '#/components/schemas/json_api1',
                metrika_api: '#/components/schemas/metrika_api1',
                mssql: '#/components/schemas/mssql1',
                mysql: '#/components/schemas/mysql1',
                oracle: '#/components/schemas/oracle1',
                postgres: '#/components/schemas/postgres1',
                promql: '#/components/schemas/promql1',
                solomon: '#/components/schemas/solomon1',
                usage_tracking_ya_team: '#/components/schemas/usage_tracking_ya_team1',
                yadocs: '#/components/schemas/yadocs1',
                ydb: '#/components/schemas/ydb1',
            },
        },
    },
    appmetrica_api2: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            counter_id: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            accuracy: {
                type: ['number', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            token: {
                type: 'string',
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['counter_id', 'name', 'token'],
        additionalProperties: false,
        title: 'appmetrica_api',
    },
    ch_over_yt2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            additional_cluster: {
                type: 'string',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            token: {
                type: 'string',
                writeOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            alias: {
                type: 'string',
            },
            cluster: {
                type: 'string',
            },
        },
        required: ['alias', 'cluster', 'name', 'token'],
        additionalProperties: false,
        title: 'ch_over_yt',
    },
    ch_over_yt_user_auth2: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            alias: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            additional_cluster: {
                type: 'string',
            },
            cluster: {
                type: 'string',
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['alias', 'cluster', 'name'],
        additionalProperties: false,
        title: 'ch_over_yt_user_auth',
    },
    clickhouse2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            connection_manager_folder_id: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            readonly: {
                type: 'integer',
                default: 2,
            },
            data_export_forbidden: {
                default: 'off',
            },
            connection_manager_cloud_id: {
                type: ['string', 'null'],
            },
            connection_manager_connection_id: {
                type: ['string', 'null'],
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            secure: {},
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            connection_manager_delegation_is_set: {
                type: ['boolean', 'null'],
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            db_name: {
                type: ['string', 'null'],
            },
        },
        required: ['host', 'name', 'port'],
        additionalProperties: false,
        title: 'clickhouse',
    },
    file2: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            sources: {
                minItems: 1,
                maxItems: 10,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/FileSource',
                },
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            data_export_forbidden: {
                default: 'off',
            },
            component_errors: {
                $ref: '#/components/schemas/ComponentErrorList',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            replace_sources: {
                default: [],
                writeOnly: true,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ReplaceFileSource',
                },
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['name'],
        additionalProperties: false,
        title: 'file',
    },
    greenplum2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            enforce_collate: {
                default: 'auto',
                type: 'string',
                enum: ['auto', 'on', 'off'],
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: 'string',
                writeOnly: true,
            },
            username: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            db_name: {
                type: ['string', 'null'],
            },
        },
        required: ['host', 'name', 'password', 'port', 'username'],
        additionalProperties: false,
        title: 'greenplum',
    },
    gsheets2: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            url: {
                type: 'string',
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['name', 'url'],
        additionalProperties: false,
        title: 'gsheets',
    },
    json_api2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            allowed_methods: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['GET', 'POST'],
                },
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            plain_headers: {
                type: ['object', 'null'],
                additionalProperties: {
                    type: ['string', 'null'],
                },
            },
            path: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            secret_headers: {
                type: ['object', 'null'],
                additionalProperties: {
                    type: ['string', 'null'],
                },
            },
            tvm_dst_id: {
                type: ['integer', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            secure: {
                type: 'boolean',
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
        },
        required: ['allowed_methods', 'host', 'name', 'port'],
        additionalProperties: false,
        title: 'json_api',
    },
    metrika_api2: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            counter_id: {
                type: 'string',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            data_export_forbidden: {
                default: 'off',
            },
            accuracy: {
                type: ['number', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            token: {
                type: 'string',
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['counter_id', 'name', 'token'],
        additionalProperties: false,
        title: 'metrika_api',
    },
    mssql2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: 'string',
                writeOnly: true,
            },
            username: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            db_name: {
                type: ['string', 'null'],
            },
        },
        required: ['host', 'name', 'password', 'port', 'username'],
        additionalProperties: false,
        title: 'mssql',
    },
    mysql2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            connection_manager_folder_id: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            connection_manager_cloud_id: {
                type: ['string', 'null'],
            },
            connection_manager_connection_id: {
                type: ['string', 'null'],
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            connection_manager_delegation_is_set: {
                type: ['boolean', 'null'],
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            db_name: {
                type: ['string', 'null'],
            },
        },
        required: ['host', 'name', 'port'],
        additionalProperties: false,
        title: 'mysql',
    },
    oracle2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: 'string',
                writeOnly: true,
            },
            username: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            db_connect_method: {
                type: 'string',
                enum: ['sid', 'service_name'],
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            db_name: {
                type: ['string', 'null'],
            },
        },
        required: ['db_connect_method', 'host', 'name', 'password', 'port', 'username'],
        additionalProperties: false,
        title: 'oracle',
    },
    postgres2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            connection_manager_folder_id: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            connection_manager_cloud_id: {
                type: ['string', 'null'],
            },
            connection_manager_connection_id: {
                type: ['string', 'null'],
            },
            mdb_cluster_id: {
                type: ['string', 'null'],
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            enforce_collate: {
                default: 'auto',
                type: 'string',
                enum: ['auto', 'on', 'off'],
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            connection_manager_delegation_is_set: {
                type: ['boolean', 'null'],
            },
            port: {
                type: 'integer',
            },
            mdb_folder_id: {
                type: ['string', 'null'],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            db_name: {
                type: ['string', 'null'],
            },
        },
        required: ['host', 'name', 'port'],
        additionalProperties: false,
        title: 'postgres',
    },
    promql2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            path: {
                type: ['string', 'null'],
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            password: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            secure: {
                type: 'boolean',
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            port: {
                type: 'integer',
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            db_name: {
                type: ['string', 'null'],
            },
        },
        required: ['host', 'name', 'port'],
        additionalProperties: false,
        title: 'promql',
    },
    solomon2: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            host: {
                type: 'string',
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['host', 'name'],
        additionalProperties: false,
        title: 'solomon',
    },
    usage_tracking_ya_team2: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            meta: {
                type: 'object',
                readOnly: true,
                additionalProperties: {},
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['name'],
        additionalProperties: false,
        title: 'usage_tracking_ya_team',
    },
    yadocs2: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            id: {
                type: 'string',
                readOnly: true,
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            sources: {
                minItems: 1,
                maxItems: 10,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/YaDocsFileSource',
                },
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            data_export_forbidden: {
                default: 'off',
            },
            component_errors: {
                $ref: '#/components/schemas/ComponentErrorList',
            },
            oauth_token: {
                type: ['string', 'null'],
                default: null,
                writeOnly: true,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            replace_sources: {
                default: [],
                writeOnly: true,
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ReplaceFileSource',
                },
            },
            refresh_enabled: {
                type: 'boolean',
            },
            authorized: {
                type: 'boolean',
                readOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['name'],
        additionalProperties: false,
        title: 'yadocs',
    },
    ydb2: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                readOnly: true,
            },
            ssl_ca: {
                default: null,
                writeOnly: true,
            },
            workbook_id: {
                type: ['string', 'null'],
                default: null,
            },
            raw_sql_level: {
                default: 'off',
                type: 'string',
                enum: ['off', 'subselect', 'template', 'dashsql'],
            },
            data_export_forbidden: {
                default: 'off',
            },
            description: {
                type: ['string', 'null'],
                default: '',
            },
            updated_at: {
                type: 'string',
                readOnly: true,
            },
            host: {
                type: 'string',
            },
            username: {
                type: ['string', 'null'],
            },
            cache_ttl_sec: {
                type: ['integer', 'null'],
                default: null,
            },
            key: {
                type: 'string',
                readOnly: true,
            },
            ssl_enable: {
                default: 'off',
            },
            token: {
                type: ['string', 'null'],
                writeOnly: true,
            },
            port: {
                type: 'integer',
            },
            auth_type: {
                type: ['string', 'null'],
                enum: ['anonymous', 'password', 'oauth', null],
            },
            created_at: {
                type: 'string',
                readOnly: true,
            },
            db_name: {
                type: 'string',
            },
        },
        required: ['db_name', 'host', 'name', 'port'],
        additionalProperties: false,
        title: 'ydb',
    },
    ConnectionUpdate: {
        type: 'object',
        properties: {},
        additionalProperties: false,
        oneOf: [
            {
                $ref: '#/components/schemas/appmetrica_api2',
            },
            {
                $ref: '#/components/schemas/ch_over_yt2',
            },
            {
                $ref: '#/components/schemas/ch_over_yt_user_auth2',
            },
            {
                $ref: '#/components/schemas/clickhouse2',
            },
            {
                $ref: '#/components/schemas/file2',
            },
            {
                $ref: '#/components/schemas/greenplum2',
            },
            {
                $ref: '#/components/schemas/gsheets2',
            },
            {
                $ref: '#/components/schemas/json_api2',
            },
            {
                $ref: '#/components/schemas/metrika_api2',
            },
            {
                $ref: '#/components/schemas/mssql2',
            },
            {
                $ref: '#/components/schemas/mysql2',
            },
            {
                $ref: '#/components/schemas/oracle2',
            },
            {
                $ref: '#/components/schemas/postgres2',
            },
            {
                $ref: '#/components/schemas/promql2',
            },
            {
                $ref: '#/components/schemas/solomon2',
            },
            {
                $ref: '#/components/schemas/usage_tracking_ya_team2',
            },
            {
                $ref: '#/components/schemas/yadocs2',
            },
            {
                $ref: '#/components/schemas/ydb2',
            },
        ],
        discriminator: {
            propertyName: 'type',
            mapping: {
                appmetrica_api: '#/components/schemas/appmetrica_api2',
                ch_over_yt: '#/components/schemas/ch_over_yt2',
                ch_over_yt_user_auth: '#/components/schemas/ch_over_yt_user_auth2',
                clickhouse: '#/components/schemas/clickhouse2',
                file: '#/components/schemas/file2',
                greenplum: '#/components/schemas/greenplum2',
                gsheets: '#/components/schemas/gsheets2',
                json_api: '#/components/schemas/json_api2',
                metrika_api: '#/components/schemas/metrika_api2',
                mssql: '#/components/schemas/mssql2',
                mysql: '#/components/schemas/mysql2',
                oracle: '#/components/schemas/oracle2',
                postgres: '#/components/schemas/postgres2',
                promql: '#/components/schemas/promql2',
                solomon: '#/components/schemas/solomon2',
                usage_tracking_ya_team: '#/components/schemas/usage_tracking_ya_team2',
                yadocs: '#/components/schemas/yadocs2',
                ydb: '#/components/schemas/ydb2',
            },
        },
    },
    DataTypeListItem: {
        type: 'object',
        properties: {
            filter_operations: {
                type: 'array',
                items: {
                    type: 'string',
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
            type: {
                type: 'string',
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
                    enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
                },
            },
            casts: {
                type: 'array',
                items: {
                    type: 'string',
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
        },
    },
    DataTypes: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/DataTypeListItem',
                },
            },
        },
    },
    FieldListItem: {
        type: 'object',
        properties: {
            guid: {
                type: 'string',
            },
            aggregations: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
                },
            },
            casts: {
                type: 'array',
                items: {
                    type: 'string',
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
        },
    },
    Fields: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/FieldListItem',
                },
            },
        },
    },
    Preview: {
        type: 'object',
        properties: {
            enabled: {
                type: 'boolean',
            },
        },
    },
    SourceListItem: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            schema_update_enabled: {
                type: 'boolean',
            },
        },
    },
    Avatars: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/SourceListItem',
                },
            },
            max: {
                type: 'integer',
            },
        },
    },
    Join: {
        type: 'object',
        properties: {
            types: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['inner', 'left', 'right', 'full'],
                },
            },
            operators: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: ['gt', 'lt', 'gte', 'lte', 'eq', 'ne'],
                },
            },
        },
    },
    CompatConnectionTypeListItem: {
        type: 'object',
        properties: {
            conn_type: {},
        },
    },
    ConnectionListItem: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            replacement_types: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/CompatConnectionTypeListItem',
                },
            },
        },
    },
    Connections: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ConnectionListItem',
                },
            },
            compatible_types: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/CompatConnectionTypeListItem',
                },
            },
            max: {
                type: 'integer',
            },
        },
    },
    SourceListItem1: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            schema_update_enabled: {
                type: 'boolean',
            },
        },
    },
    CompatSourceTypeListItem: {
        type: 'object',
        properties: {
            source_type: {},
        },
    },
    Sources: {
        type: 'object',
        properties: {
            items: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/SourceListItem1',
                },
            },
            compatible_types: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/CompatSourceTypeListItem',
                },
            },
            max: {
                type: 'integer',
            },
        },
    },
    Options: {
        type: 'object',
        properties: {
            data_types: {
                $ref: '#/components/schemas/DataTypes',
            },
            supported_functions: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            fields: {
                $ref: '#/components/schemas/Fields',
            },
            schema_update_enabled: {
                type: 'boolean',
            },
            supports_offset: {
                type: 'boolean',
            },
            preview: {
                $ref: '#/components/schemas/Preview',
            },
            source_avatars: {
                $ref: '#/components/schemas/Avatars',
            },
            join: {
                $ref: '#/components/schemas/Join',
            },
            connections: {
                $ref: '#/components/schemas/Connections',
            },
            sources: {
                $ref: '#/components/schemas/Sources',
            },
        },
    },
    Where: {
        type: 'object',
        properties: {
            operation: {
                type: 'string',
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
                type: ['array', 'null'],
                items: {},
            },
            column: {
                type: 'string',
            },
        },
        required: ['column', 'operation', 'values'],
    },
    ObligatoryFilter: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            managed_by: {
                default: 'user',
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            field_guid: {
                type: 'string',
            },
            default_filters: {
                default: [],
                type: 'array',
                items: {
                    $ref: '#/components/schemas/Where',
                },
            },
        },
        required: ['id'],
    },
    direct: {
        type: 'object',
        properties: {
            calc_mode: {
                type: 'string',
                enum: ['direct', 'formula', 'result_field'],
            },
            source: {
                type: 'string',
            },
        },
        required: ['calc_mode', 'source'],
    },
    formula: {
        type: 'object',
        properties: {
            calc_mode: {
                type: 'string',
                enum: ['direct', 'formula', 'result_field'],
            },
            formula: {
                type: 'string',
            },
        },
        required: ['calc_mode', 'formula'],
    },
    result_field: {
        type: 'object',
        properties: {
            calc_mode: {
                type: 'string',
                enum: ['direct', 'formula', 'result_field'],
            },
            field_id: {
                type: 'string',
            },
        },
        required: ['calc_mode', 'field_id'],
    },
    ConditionPartGeneric: {
        type: 'object',
        properties: {},
        oneOf: [
            {
                $ref: '#/components/schemas/direct',
            },
            {
                $ref: '#/components/schemas/formula',
            },
            {
                $ref: '#/components/schemas/result_field',
            },
        ],
        discriminator: {
            propertyName: 'calc_mode',
            mapping: {
                direct: '#/components/schemas/direct',
                formula: '#/components/schemas/formula',
                result_field: '#/components/schemas/result_field',
            },
        },
    },
    JoinCondition: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                enum: ['binary'],
            },
            right: {
                $ref: '#/components/schemas/ConditionPartGeneric',
            },
            left: {
                $ref: '#/components/schemas/ConditionPartGeneric',
            },
            operator: {
                type: 'string',
                enum: ['gt', 'lt', 'gte', 'lte', 'eq', 'ne'],
            },
        },
        required: ['left', 'operator', 'right', 'type'],
    },
    AvatarRelation: {
        type: 'object',
        properties: {
            left_avatar_id: {
                type: 'string',
            },
            id: {
                type: 'string',
            },
            managed_by: {
                default: 'user',
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            conditions: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/JoinCondition',
                },
            },
            join_type: {
                type: 'string',
                enum: ['inner', 'left', 'right', 'full'],
            },
            required: {
                type: 'boolean',
                default: false,
            },
            right_avatar_id: {
                type: 'string',
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id'],
    },
    FieldInterDependencyItem: {
        type: 'object',
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
    },
    FieldInterDependencyInfo: {
        type: 'object',
        properties: {
            deps: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/FieldInterDependencyItem',
                },
            },
        },
    },
    ResultSchemaAux: {
        type: 'object',
        properties: {
            inter_dependencies: {
                $ref: '#/components/schemas/FieldInterDependencyInfo',
            },
        },
    },
    SourceAvatarStrict: {
        type: 'object',
        properties: {
            source_id: {
                type: 'string',
            },
            id: {
                type: 'string',
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            is_root: {
                type: 'boolean',
            },
            valid: {
                type: 'boolean',
                readOnly: true,
            },
            title: {
                type: 'string',
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'managed_by'],
    },
    RLSSubject: {
        type: 'object',
        properties: {
            subject_id: {
                type: 'string',
            },
            subject_type: {
                type: 'string',
                enum: ['user', 'group', 'all', 'userid', 'unknown', 'notfound'],
            },
            subject_name: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['subject_id'],
    },
    RLS2ConfigEntry: {
        type: 'object',
        properties: {
            allowed_value: {
                type: ['string', 'null'],
                default: null,
            },
            pattern_type: {
                type: 'string',
                enum: ['value', 'all', 'userid'],
            },
            subject: {
                $ref: '#/components/schemas/RLSSubject',
            },
            field_guid: {
                type: ['string', 'null'],
                default: null,
            },
        },
        required: ['subject'],
    },
    direct1: {
        type: 'object',
        properties: {
            source: {
                type: 'string',
            },
            hidden: {
                type: 'boolean',
                default: false,
            },
            initial_data_type: {
                type: ['string', 'null'],
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
                    null,
                ],
            },
            has_auto_aggregation: {
                type: ['boolean', 'null'],
            },
            ui_settings: {
                type: 'string',
                default: '',
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: ['boolean', 'null'],
            },
            guid: {
                type: 'string',
            },
            type: {
                type: 'string',
                enum: ['DIMENSION', 'MEASURE'],
            },
            aggregation: {
                default: 'none',
                type: 'string',
                enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
            },
            aggregation_locked: {
                type: ['boolean', 'null'],
                default: false,
                readOnly: true,
            },
            description: {
                type: 'string',
            },
            calc_spec: {
                $ref: '#/components/schemas/CalculationSpec',
            },
            lock_aggregation: {
                type: ['boolean', 'null'],
            },
            title: {
                type: 'string',
            },
            cast: {
                type: 'string',
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
            virtual: {
                readOnly: true,
            },
            data_type: {
                type: ['string', 'null'],
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
                    null,
                ],
            },
            avatar_id: {
                type: ['string', 'null'],
            },
            autoaggregated: {
                type: ['boolean', 'null'],
                readOnly: true,
            },
        },
        required: ['title'],
    },
    formula1: {
        type: 'object',
        properties: {
            guid_formula: {
                type: 'string',
                default: '',
            },
            formula: {
                type: 'string',
                default: '',
            },
        },
    },
    string: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'string',
            },
        },
    },
    integer: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'integer',
            },
        },
    },
    float: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'number',
            },
        },
    },
    date: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'string',
                format: 'date',
            },
        },
    },
    datetime: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'string',
                format: 'date-time',
            },
        },
    },
    datetimetz: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'string',
                format: 'date-time',
            },
        },
    },
    genericdatetime: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'string',
                format: 'date-time',
            },
        },
    },
    boolean: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'boolean',
            },
        },
    },
    geopoint: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'array',
                items: {
                    type: 'number',
                },
            },
        },
    },
    geopolygon: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'array',
                items: {
                    type: 'array',
                    items: {
                        type: 'array',
                        items: {
                            type: 'number',
                        },
                    },
                },
            },
        },
    },
    uuid: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'string',
            },
        },
    },
    markup: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'string',
            },
        },
    },
    array_str: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },
    },
    array_int: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'array',
                items: {
                    type: 'integer',
                },
            },
        },
    },
    array_float: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'array',
                items: {
                    type: 'number',
                },
            },
        },
    },
    tree_str: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
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
            value: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
        },
    },
    Value: {
        type: 'object',
        properties: {},
        oneOf: [
            {
                $ref: '#/components/schemas/string',
            },
            {
                $ref: '#/components/schemas/integer',
            },
            {
                $ref: '#/components/schemas/float',
            },
            {
                $ref: '#/components/schemas/date',
            },
            {
                $ref: '#/components/schemas/datetime',
            },
            {
                $ref: '#/components/schemas/datetimetz',
            },
            {
                $ref: '#/components/schemas/genericdatetime',
            },
            {
                $ref: '#/components/schemas/boolean',
            },
            {
                $ref: '#/components/schemas/geopoint',
            },
            {
                $ref: '#/components/schemas/geopolygon',
            },
            {
                $ref: '#/components/schemas/uuid',
            },
            {
                $ref: '#/components/schemas/markup',
            },
            {
                $ref: '#/components/schemas/array_str',
            },
            {
                $ref: '#/components/schemas/array_int',
            },
            {
                $ref: '#/components/schemas/array_float',
            },
            {
                $ref: '#/components/schemas/tree_str',
            },
        ],
        discriminator: {
            propertyName: 'type',
            mapping: {
                string: '#/components/schemas/string',
                integer: '#/components/schemas/integer',
                float: '#/components/schemas/float',
                date: '#/components/schemas/date',
                datetime: '#/components/schemas/datetime',
                datetimetz: '#/components/schemas/datetimetz',
                genericdatetime: '#/components/schemas/genericdatetime',
                boolean: '#/components/schemas/boolean',
                geopoint: '#/components/schemas/geopoint',
                geopolygon: '#/components/schemas/geopolygon',
                uuid: '#/components/schemas/uuid',
                markup: '#/components/schemas/markup',
                array_str: '#/components/schemas/array_str',
                array_int: '#/components/schemas/array_int',
                array_float: '#/components/schemas/array_float',
                tree_str: '#/components/schemas/tree_str',
            },
        },
    },
    regex: {
        type: 'object',
        properties: {
            pattern: {
                type: 'string',
            },
            type: {
                type: 'string',
                const: 'regex',
                readOnly: false,
            },
        },
        additionalProperties: false,
        title: 'regex',
    },
    default: {
        type: 'object',
        properties: {
            type: {
                type: 'string',
                const: 'default',
                readOnly: false,
            },
        },
        additionalProperties: false,
        title: 'default',
    },
    ParameterValueConstraint: {
        type: 'object',
        properties: {},
        oneOf: [
            {
                $ref: '#/components/schemas/regex',
            },
            {
                $ref: '#/components/schemas/default',
            },
        ],
        discriminator: {
            propertyName: 'type',
            mapping: {
                regex: '#/components/schemas/regex',
                default: '#/components/schemas/default',
            },
        },
    },
    parameter: {
        type: 'object',
        properties: {
            default_value: {
                anyOf: [
                    {
                        $ref: '#/components/schemas/Value',
                    },
                    {
                        type: 'null',
                    },
                ],
            },
            value_constraint: {
                anyOf: [
                    {
                        $ref: '#/components/schemas/ParameterValueConstraint',
                    },
                    {
                        type: 'null',
                    },
                ],
            },
            template_enabled: {
                type: 'boolean',
                default: false,
            },
        },
    },
    CalculationSpec: {
        type: 'object',
        properties: {},
        additionalProperties: false,
        oneOf: [
            {
                $ref: '#/components/schemas/direct1',
            },
            {
                $ref: '#/components/schemas/formula1',
            },
            {
                $ref: '#/components/schemas/parameter',
            },
        ],
        discriminator: {
            propertyName: 'mode',
            mapping: {
                direct: '#/components/schemas/direct1',
                formula: '#/components/schemas/formula1',
                parameter: '#/components/schemas/parameter',
            },
        },
    },
    formula2: {
        type: 'object',
        properties: {
            hidden: {
                type: 'boolean',
                default: false,
            },
            initial_data_type: {
                type: ['string', 'null'],
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
                    null,
                ],
            },
            has_auto_aggregation: {
                type: ['boolean', 'null'],
            },
            ui_settings: {
                type: 'string',
                default: '',
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: ['boolean', 'null'],
            },
            guid: {
                type: 'string',
            },
            type: {
                type: 'string',
                enum: ['DIMENSION', 'MEASURE'],
            },
            aggregation: {
                default: 'none',
                type: 'string',
                enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
            },
            guid_formula: {
                type: 'string',
                default: '',
            },
            formula: {
                type: 'string',
                default: '',
            },
            aggregation_locked: {
                type: ['boolean', 'null'],
                default: false,
                readOnly: true,
            },
            description: {
                type: 'string',
            },
            calc_spec: {
                $ref: '#/components/schemas/CalculationSpec',
            },
            lock_aggregation: {
                type: ['boolean', 'null'],
            },
            title: {
                type: 'string',
            },
            cast: {
                type: 'string',
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
            virtual: {
                readOnly: true,
            },
            data_type: {
                type: ['string', 'null'],
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
                    null,
                ],
            },
            autoaggregated: {
                type: ['boolean', 'null'],
                readOnly: true,
            },
        },
        required: ['title'],
    },
    parameter1: {
        type: 'object',
        properties: {
            hidden: {
                type: 'boolean',
                default: false,
            },
            initial_data_type: {
                type: ['string', 'null'],
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
                    null,
                ],
            },
            has_auto_aggregation: {
                type: ['boolean', 'null'],
            },
            ui_settings: {
                type: 'string',
                default: '',
            },
            value_constraint: {
                anyOf: [
                    {
                        $ref: '#/components/schemas/ParameterValueConstraint',
                    },
                    {
                        type: 'null',
                    },
                ],
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: ['boolean', 'null'],
            },
            guid: {
                type: 'string',
            },
            default_value: {
                type: ['string', 'null'],
            },
            type: {
                type: 'string',
                enum: ['DIMENSION', 'MEASURE'],
            },
            aggregation: {
                default: 'none',
                type: 'string',
                enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
            },
            aggregation_locked: {
                type: ['boolean', 'null'],
                default: false,
                readOnly: true,
            },
            description: {
                type: 'string',
            },
            template_enabled: {
                type: 'boolean',
                default: false,
            },
            calc_spec: {
                $ref: '#/components/schemas/CalculationSpec',
            },
            lock_aggregation: {
                type: ['boolean', 'null'],
            },
            title: {
                type: 'string',
            },
            cast: {
                type: 'string',
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
            virtual: {
                readOnly: true,
            },
            data_type: {
                type: ['string', 'null'],
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
                    null,
                ],
            },
            autoaggregated: {
                type: ['boolean', 'null'],
                readOnly: true,
            },
        },
        required: ['title'],
    },
    CleanerResultSchemaSchemaGeneric: {
        type: 'object',
        properties: {},
        additionalProperties: false,
        oneOf: [
            {
                $ref: '#/components/schemas/direct1',
            },
            {
                $ref: '#/components/schemas/formula2',
            },
            {
                $ref: '#/components/schemas/parameter1',
            },
        ],
        discriminator: {
            propertyName: 'calc_mode',
            mapping: {
                direct: '#/components/schemas/direct1',
                formula: '#/components/schemas/formula2',
                parameter: '#/components/schemas/parameter1',
            },
        },
    },
    IndexInfo: {
        type: 'object',
        properties: {
            columns: {
                type: 'array',
                items: {
                    type: 'string',
                },
            },
            kind: {
                type: ['string', 'null'],
                enum: ['table_sorting', null],
            },
        },
        required: ['columns'],
    },
    generic_native_type: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
        },
    },
    common_native_type: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
            nullable: {
                type: 'boolean',
                default: true,
            },
        },
    },
    lengthed_native_type: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
            nullable: {
                type: 'boolean',
                default: true,
            },
            length: {
                type: ['integer', 'null'],
                default: null,
            },
        },
    },
    clickhouse_native_type: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
            nullable: {
                type: 'boolean',
                default: true,
            },
            lowcardinality: {
                type: 'boolean',
                default: false,
            },
        },
    },
    clickhouse_datetimewithtz_native_type: {
        type: 'object',
        properties: {
            explicit_timezone: {
                type: 'boolean',
                default: true,
            },
            timezone_name: {
                type: 'string',
                default: 'UTC',
            },
            lowcardinality: {
                type: 'boolean',
                default: false,
            },
            name: {
                type: 'string',
            },
            nullable: {
                type: 'boolean',
                default: true,
            },
        },
    },
    clickhouse_datetime64_native_type: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
            nullable: {
                type: 'boolean',
                default: true,
            },
            lowcardinality: {
                type: 'boolean',
                default: false,
            },
            precision: {
                type: 'integer',
            },
        },
        required: ['precision'],
    },
    clickhouse_datetime64withtz_native_type: {
        type: 'object',
        properties: {
            explicit_timezone: {
                type: 'boolean',
                default: true,
            },
            timezone_name: {
                type: 'string',
                default: 'UTC',
            },
            precision: {
                type: 'integer',
            },
            lowcardinality: {
                type: 'boolean',
                default: false,
            },
            name: {
                type: 'string',
            },
            nullable: {
                type: 'boolean',
                default: true,
            },
        },
        required: ['precision'],
    },
    OneOfNativeType: {
        type: 'object',
        properties: {},
        oneOf: [
            {
                $ref: '#/components/schemas/generic_native_type',
            },
            {
                $ref: '#/components/schemas/common_native_type',
            },
            {
                $ref: '#/components/schemas/lengthed_native_type',
            },
            {
                $ref: '#/components/schemas/clickhouse_native_type',
            },
            {
                $ref: '#/components/schemas/clickhouse_datetimewithtz_native_type',
            },
            {
                $ref: '#/components/schemas/clickhouse_datetime64_native_type',
            },
            {
                $ref: '#/components/schemas/clickhouse_datetime64withtz_native_type',
            },
        ],
        discriminator: {
            propertyName: 'native_type_class_name',
            mapping: {
                generic_native_type: '#/components/schemas/generic_native_type',
                common_native_type: '#/components/schemas/common_native_type',
                lengthed_native_type: '#/components/schemas/lengthed_native_type',
                clickhouse_native_type: '#/components/schemas/clickhouse_native_type',
                clickhouse_datetimewithtz_native_type:
                    '#/components/schemas/clickhouse_datetimewithtz_native_type',
                clickhouse_datetime64_native_type:
                    '#/components/schemas/clickhouse_datetime64_native_type',
                clickhouse_datetime64withtz_native_type:
                    '#/components/schemas/clickhouse_datetime64withtz_native_type',
            },
        },
    },
    RawSchemaColumn1: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
            },
            native_type: {
                anyOf: [
                    {
                        $ref: '#/components/schemas/OneOfNativeType',
                    },
                    {
                        type: 'null',
                    },
                ],
            },
            user_type: {
                type: 'string',
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
            title: {
                type: 'string',
            },
            lock_aggregation: {
                type: ['boolean', 'null'],
            },
            name: {
                type: 'string',
            },
            nullable: {
                type: ['boolean', 'null'],
            },
            has_auto_aggregation: {
                type: ['boolean', 'null'],
            },
        },
    },
    SQLParameters: {
        type: 'object',
        properties: {
            table_name: {
                type: ['string', 'null'],
            },
            db_version: {
                type: ['string', 'null'],
            },
            db_name: {
                type: ['string', 'null'],
            },
        },
    },
    APPMETRICA_API: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'APPMETRICA_API',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'APPMETRICA_API',
    },
    CHYT_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_TABLE',
    },
    CHYTTableListParameters: {
        type: 'object',
        properties: {
            table_names: {
                type: 'string',
            },
        },
    },
    CHYT_TABLE_LIST: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_TABLE_LIST',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/CHYTTableListParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_TABLE_LIST',
    },
    CHYTTableRangeParameters: {
        type: 'object',
        properties: {
            range_to: {
                type: 'string',
            },
            range_from: {
                type: 'string',
            },
            directory_path: {
                type: 'string',
            },
        },
    },
    CHYT_TABLE_RANGE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_TABLE_RANGE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/CHYTTableRangeParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_TABLE_RANGE',
    },
    SubselectParameters: {
        type: 'object',
        properties: {
            subsql: {
                type: 'string',
            },
        },
    },
    CHYT_SUBSELECT: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_SUBSELECT',
    },
    CHYT_USER_AUTH_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_USER_AUTH_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_USER_AUTH_TABLE',
    },
    CHYT_USER_AUTH_TABLE_LIST: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_USER_AUTH_TABLE_LIST',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/CHYTTableListParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_USER_AUTH_TABLE_LIST',
    },
    CHYT_USER_AUTH_TABLE_RANGE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_USER_AUTH_TABLE_RANGE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/CHYTTableRangeParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_USER_AUTH_TABLE_RANGE',
    },
    CHYT_USER_AUTH_SUBSELECT: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_USER_AUTH_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_USER_AUTH_SUBSELECT',
    },
    CH_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CH_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CH_TABLE',
    },
    CH_SUBSELECT: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CH_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CH_SUBSELECT',
    },
    BaseFileS3DataSourceParameters: {
        type: 'object',
        properties: {
            origin_source_id: {
                type: ['string', 'null'],
                default: null,
            },
        },
    },
    FILE_S3_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'FILE_S3_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/BaseFileS3DataSourceParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'FILE_S3_TABLE',
    },
    SchematizedParameters: {
        type: 'object',
        properties: {
            table_name: {
                type: ['string', 'null'],
            },
            db_version: {
                type: ['string', 'null'],
            },
            schema_name: {
                type: ['string', 'null'],
            },
            db_name: {
                type: ['string', 'null'],
            },
        },
    },
    GP_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'GP_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SchematizedParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'GP_TABLE',
    },
    GP_SUBSELECT: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'GP_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'GP_SUBSELECT',
    },
    SimpleParameters: {
        type: 'object',
        properties: {},
    },
    GSHEETS: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'GSHEETS',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SimpleParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'GSHEETS',
    },
    JSON_API: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'JSON_API',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SimpleParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'JSON_API',
    },
    METRIKA_API: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'METRIKA_API',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'METRIKA_API',
    },
    MSSQL_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'MSSQL_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SchematizedParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'MSSQL_TABLE',
    },
    MSSQL_SUBSELECT: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'MSSQL_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'MSSQL_SUBSELECT',
    },
    MYSQL_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'MYSQL_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'MYSQL_TABLE',
    },
    MYSQL_SUBSELECT: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'MYSQL_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'MYSQL_SUBSELECT',
    },
    ORACLE_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'ORACLE_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SchematizedParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'ORACLE_TABLE',
    },
    ORACLE_SUBSELECT: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'ORACLE_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'ORACLE_SUBSELECT',
    },
    PG_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'PG_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SchematizedParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'PG_TABLE',
    },
    PG_SUBSELECT: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'PG_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'PG_SUBSELECT',
    },
    PROMQL: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'PROMQL',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SimpleParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'PROMQL',
    },
    SOLOMON: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'SOLOMON',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SimpleParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'SOLOMON',
    },
    CH_USAGE_TRACKING_YA_TEAM_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CH_USAGE_TRACKING_YA_TEAM_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CH_USAGE_TRACKING_YA_TEAM_TABLE',
    },
    YADOCS: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'YADOCS',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/BaseFileS3DataSourceParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'YADOCS',
    },
    YDB_TABLE: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'YDB_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'YDB_TABLE',
    },
    YDB_SUBSELECT: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'YDB_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'YDB_SUBSELECT',
    },
    DataSourceStrict: {
        type: 'object',
        properties: {},
        oneOf: [
            {
                $ref: '#/components/schemas/APPMETRICA_API',
            },
            {
                $ref: '#/components/schemas/CHYT_TABLE',
            },
            {
                $ref: '#/components/schemas/CHYT_TABLE_LIST',
            },
            {
                $ref: '#/components/schemas/CHYT_TABLE_RANGE',
            },
            {
                $ref: '#/components/schemas/CHYT_SUBSELECT',
            },
            {
                $ref: '#/components/schemas/CHYT_USER_AUTH_TABLE',
            },
            {
                $ref: '#/components/schemas/CHYT_USER_AUTH_TABLE_LIST',
            },
            {
                $ref: '#/components/schemas/CHYT_USER_AUTH_TABLE_RANGE',
            },
            {
                $ref: '#/components/schemas/CHYT_USER_AUTH_SUBSELECT',
            },
            {
                $ref: '#/components/schemas/CH_TABLE',
            },
            {
                $ref: '#/components/schemas/CH_SUBSELECT',
            },
            {
                $ref: '#/components/schemas/FILE_S3_TABLE',
            },
            {
                $ref: '#/components/schemas/GP_TABLE',
            },
            {
                $ref: '#/components/schemas/GP_SUBSELECT',
            },
            {
                $ref: '#/components/schemas/GSHEETS',
            },
            {
                $ref: '#/components/schemas/JSON_API',
            },
            {
                $ref: '#/components/schemas/METRIKA_API',
            },
            {
                $ref: '#/components/schemas/MSSQL_TABLE',
            },
            {
                $ref: '#/components/schemas/MSSQL_SUBSELECT',
            },
            {
                $ref: '#/components/schemas/MYSQL_TABLE',
            },
            {
                $ref: '#/components/schemas/MYSQL_SUBSELECT',
            },
            {
                $ref: '#/components/schemas/ORACLE_TABLE',
            },
            {
                $ref: '#/components/schemas/ORACLE_SUBSELECT',
            },
            {
                $ref: '#/components/schemas/PG_TABLE',
            },
            {
                $ref: '#/components/schemas/PG_SUBSELECT',
            },
            {
                $ref: '#/components/schemas/PROMQL',
            },
            {
                $ref: '#/components/schemas/SOLOMON',
            },
            {
                $ref: '#/components/schemas/CH_USAGE_TRACKING_YA_TEAM_TABLE',
            },
            {
                $ref: '#/components/schemas/YADOCS',
            },
            {
                $ref: '#/components/schemas/YDB_TABLE',
            },
            {
                $ref: '#/components/schemas/YDB_SUBSELECT',
            },
        ],
        discriminator: {
            propertyName: 'source_type',
            mapping: {
                APPMETRICA_API: '#/components/schemas/APPMETRICA_API',
                CHYT_TABLE: '#/components/schemas/CHYT_TABLE',
                CHYT_TABLE_LIST: '#/components/schemas/CHYT_TABLE_LIST',
                CHYT_TABLE_RANGE: '#/components/schemas/CHYT_TABLE_RANGE',
                CHYT_SUBSELECT: '#/components/schemas/CHYT_SUBSELECT',
                CHYT_USER_AUTH_TABLE: '#/components/schemas/CHYT_USER_AUTH_TABLE',
                CHYT_USER_AUTH_TABLE_LIST: '#/components/schemas/CHYT_USER_AUTH_TABLE_LIST',
                CHYT_USER_AUTH_TABLE_RANGE: '#/components/schemas/CHYT_USER_AUTH_TABLE_RANGE',
                CHYT_USER_AUTH_SUBSELECT: '#/components/schemas/CHYT_USER_AUTH_SUBSELECT',
                CH_TABLE: '#/components/schemas/CH_TABLE',
                CH_SUBSELECT: '#/components/schemas/CH_SUBSELECT',
                FILE_S3_TABLE: '#/components/schemas/FILE_S3_TABLE',
                GP_TABLE: '#/components/schemas/GP_TABLE',
                GP_SUBSELECT: '#/components/schemas/GP_SUBSELECT',
                GSHEETS: '#/components/schemas/GSHEETS',
                JSON_API: '#/components/schemas/JSON_API',
                METRIKA_API: '#/components/schemas/METRIKA_API',
                MSSQL_TABLE: '#/components/schemas/MSSQL_TABLE',
                MSSQL_SUBSELECT: '#/components/schemas/MSSQL_SUBSELECT',
                MYSQL_TABLE: '#/components/schemas/MYSQL_TABLE',
                MYSQL_SUBSELECT: '#/components/schemas/MYSQL_SUBSELECT',
                ORACLE_TABLE: '#/components/schemas/ORACLE_TABLE',
                ORACLE_SUBSELECT: '#/components/schemas/ORACLE_SUBSELECT',
                PG_TABLE: '#/components/schemas/PG_TABLE',
                PG_SUBSELECT: '#/components/schemas/PG_SUBSELECT',
                PROMQL: '#/components/schemas/PROMQL',
                SOLOMON: '#/components/schemas/SOLOMON',
                CH_USAGE_TRACKING_YA_TEAM_TABLE:
                    '#/components/schemas/CH_USAGE_TRACKING_YA_TEAM_TABLE',
                YADOCS: '#/components/schemas/YADOCS',
                YDB_TABLE: '#/components/schemas/YDB_TABLE',
                YDB_SUBSELECT: '#/components/schemas/YDB_SUBSELECT',
            },
        },
    },
    CleanerDatasetContentInternal: {
        type: 'object',
        properties: {
            description: {
                type: ['string', 'null'],
                default: '',
            },
            revision_id: {
                type: ['string', 'null'],
                default: null,
            },
            obligatory_filters: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/ObligatoryFilter',
                },
            },
            template_enabled: {
                type: 'boolean',
                default: false,
            },
            component_errors: {
                $ref: '#/components/schemas/ComponentErrorList',
            },
            load_preview_by_default: {
                type: 'boolean',
                default: true,
            },
            data_export_forbidden: {
                type: 'boolean',
                default: false,
            },
            avatar_relations: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/AvatarRelation',
                },
            },
            result_schema_aux: {
                $ref: '#/components/schemas/ResultSchemaAux',
            },
            source_avatars: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/SourceAvatarStrict',
                },
            },
            rls: {
                type: 'object',
                additionalProperties: {},
            },
            rls2: {
                type: 'object',
                additionalProperties: {
                    type: 'array',
                    items: {
                        $ref: '#/components/schemas/RLS2ConfigEntry',
                    },
                },
            },
            result_schema: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/CleanerResultSchemaSchemaGeneric',
                },
            },
            preview_enabled: {
                type: 'boolean',
                default: false,
            },
            sources: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/DataSourceStrict',
                },
            },
        },
    },
    DatasetCreate: {
        type: 'object',
        properties: {
            dir_path: {
                type: 'string',
            },
            options: {
                readOnly: true,
                $ref: '#/components/schemas/Options',
            },
            name: {
                type: 'string',
            },
            preview: {
                type: 'boolean',
                default: false,
            },
            created_via: {
                default: 'user',
            },
            dataset: {
                $ref: '#/components/schemas/CleanerDatasetContentInternal',
            },
            workbook_id: {
                type: 'string',
            },
        },
    },
    DatasetRead: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            options: {
                readOnly: true,
                $ref: '#/components/schemas/Options',
            },
            key: {
                type: 'string',
            },
            is_favorite: {
                type: 'boolean',
            },
            permissions: {
                type: 'object',
                additionalProperties: {
                    type: 'boolean',
                },
            },
            dataset: {
                $ref: '#/components/schemas/CleanerDatasetContentInternal',
            },
        },
    },
    DatasetUpdate: {
        type: 'object',
        properties: {
            options: {
                readOnly: true,
                $ref: '#/components/schemas/Options',
            },
            dataset: {
                $ref: '#/components/schemas/CleanerDatasetContentInternal',
            },
        },
    },
    AddField: {
        type: 'object',
        properties: {
            avatar_id: {
                type: ['string', 'null'],
            },
            description: {
                type: 'string',
            },
            template_enabled: {
                type: ['boolean', 'null'],
            },
            calc_mode: {
                type: 'string',
                enum: ['direct', 'formula', 'parameter'],
            },
            guid: {
                type: 'string',
            },
            strict: {
                type: 'boolean',
                default: false,
            },
            source: {
                type: 'string',
            },
            cast: {
                type: ['string', 'null'],
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
                    null,
                ],
            },
            ui_settings: {
                type: 'string',
            },
            hidden: {
                type: 'boolean',
            },
            title: {
                type: 'string',
            },
            default_value: {
                anyOf: [
                    {
                        $ref: '#/components/schemas/Value',
                    },
                    {
                        type: 'null',
                    },
                ],
            },
            aggregation: {
                type: 'string',
                enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
            },
            new_id: {
                type: ['string', 'null'],
            },
            value_constraint: {
                anyOf: [
                    {
                        $ref: '#/components/schemas/ParameterValueConstraint',
                    },
                    {
                        type: 'null',
                    },
                ],
            },
            guid_formula: {
                type: 'string',
            },
            formula: {
                type: 'string',
            },
        },
        required: ['title'],
    },
    add_field: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'add_field',
            },
            field: {
                $ref: '#/components/schemas/AddField',
            },
        },
        required: ['action'],
        title: 'add_field',
    },
    UpdateField: {
        type: 'object',
        properties: {
            avatar_id: {
                type: ['string', 'null'],
            },
            description: {
                type: 'string',
            },
            template_enabled: {
                type: ['boolean', 'null'],
            },
            calc_mode: {
                type: 'string',
                enum: ['direct', 'formula', 'parameter'],
            },
            guid: {
                type: 'string',
            },
            strict: {
                type: 'boolean',
                default: false,
            },
            source: {
                type: 'string',
            },
            cast: {
                type: ['string', 'null'],
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
                    null,
                ],
            },
            ui_settings: {
                type: 'string',
            },
            hidden: {
                type: 'boolean',
            },
            title: {
                type: 'string',
            },
            default_value: {
                anyOf: [
                    {
                        $ref: '#/components/schemas/Value',
                    },
                    {
                        type: 'null',
                    },
                ],
            },
            aggregation: {
                type: 'string',
                enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique'],
            },
            new_id: {
                type: ['string', 'null'],
            },
            value_constraint: {
                anyOf: [
                    {
                        $ref: '#/components/schemas/ParameterValueConstraint',
                    },
                    {
                        type: 'null',
                    },
                ],
            },
            guid_formula: {
                type: 'string',
            },
            formula: {
                type: 'string',
            },
        },
    },
    update_field: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'update_field',
            },
            field: {
                $ref: '#/components/schemas/UpdateField',
            },
        },
        required: ['action'],
        title: 'update_field',
    },
    DeleteField: {
        type: 'object',
        properties: {
            guid: {
                type: 'string',
            },
            strict: {
                type: 'boolean',
                default: false,
            },
        },
    },
    delete_field: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'delete_field',
            },
            field: {
                $ref: '#/components/schemas/DeleteField',
            },
        },
        required: ['action', 'field'],
        title: 'delete_field',
    },
    CloneField: {
        type: 'object',
        properties: {
            guid: {
                type: 'string',
            },
            title: {
                type: 'string',
            },
            strict: {
                type: 'boolean',
                default: false,
            },
            cast: {
                type: ['string', 'null'],
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
                    null,
                ],
            },
            from_guid: {
                type: 'string',
            },
            aggregation: {
                type: ['string', 'null'],
                enum: ['none', 'sum', 'avg', 'min', 'max', 'count', 'countunique', null],
            },
        },
    },
    clone_field: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'clone_field',
            },
            field: {
                $ref: '#/components/schemas/CloneField',
            },
        },
        required: ['action', 'field'],
        title: 'clone_field',
    },
    APPMETRICA_API1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'APPMETRICA_API',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'APPMETRICA_API',
    },
    CHYT_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_TABLE',
    },
    CHYT_TABLE_LIST1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_TABLE_LIST',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/CHYTTableListParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_TABLE_LIST',
    },
    CHYT_TABLE_RANGE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_TABLE_RANGE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/CHYTTableRangeParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_TABLE_RANGE',
    },
    CHYT_SUBSELECT1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_SUBSELECT',
    },
    CHYT_USER_AUTH_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_USER_AUTH_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_USER_AUTH_TABLE',
    },
    CHYT_USER_AUTH_TABLE_LIST1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_USER_AUTH_TABLE_LIST',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/CHYTTableListParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_USER_AUTH_TABLE_LIST',
    },
    CHYT_USER_AUTH_TABLE_RANGE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_USER_AUTH_TABLE_RANGE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/CHYTTableRangeParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_USER_AUTH_TABLE_RANGE',
    },
    CHYT_USER_AUTH_SUBSELECT1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CHYT_USER_AUTH_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CHYT_USER_AUTH_SUBSELECT',
    },
    CH_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CH_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CH_TABLE',
    },
    CH_SUBSELECT1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CH_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CH_SUBSELECT',
    },
    FILE_S3_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'FILE_S3_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/BaseFileS3DataSourceParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'FILE_S3_TABLE',
    },
    GP_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'GP_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SchematizedParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'GP_TABLE',
    },
    GP_SUBSELECT1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'GP_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'GP_SUBSELECT',
    },
    GSHEETS1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'GSHEETS',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SimpleParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'GSHEETS',
    },
    JSON_API1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'JSON_API',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SimpleParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'JSON_API',
    },
    METRIKA_API1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'METRIKA_API',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'METRIKA_API',
    },
    MSSQL_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'MSSQL_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SchematizedParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'MSSQL_TABLE',
    },
    MSSQL_SUBSELECT1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'MSSQL_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'MSSQL_SUBSELECT',
    },
    MYSQL_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'MYSQL_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'MYSQL_TABLE',
    },
    MYSQL_SUBSELECT1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'MYSQL_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'MYSQL_SUBSELECT',
    },
    ORACLE_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'ORACLE_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SchematizedParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'ORACLE_TABLE',
    },
    ORACLE_SUBSELECT1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'ORACLE_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'ORACLE_SUBSELECT',
    },
    PG_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'PG_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SchematizedParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'PG_TABLE',
    },
    PG_SUBSELECT1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'PG_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'PG_SUBSELECT',
    },
    PROMQL1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'PROMQL',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SimpleParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'PROMQL',
    },
    SOLOMON1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'SOLOMON',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SimpleParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'SOLOMON',
    },
    CH_USAGE_TRACKING_YA_TEAM_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'CH_USAGE_TRACKING_YA_TEAM_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'CH_USAGE_TRACKING_YA_TEAM_TABLE',
    },
    YADOCS1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'YADOCS',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/BaseFileS3DataSourceParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'YADOCS',
    },
    YDB_TABLE1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'YDB_TABLE',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SQLParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'YDB_TABLE',
    },
    YDB_SUBSELECT1: {
        type: 'object',
        properties: {
            index_info_set: {
                type: ['array', 'null'],
                default: null,
                items: {
                    $ref: '#/components/schemas/IndexInfo',
                },
            },
            id: {
                type: 'string',
            },
            source_type: {
                type: 'string',
                const: 'YDB_SUBSELECT',
                readOnly: false,
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            valid: {
                type: 'boolean',
                default: true,
            },
            title: {
                type: 'string',
            },
            parameter_hash: {
                type: 'string',
                readOnly: true,
            },
            raw_schema: {
                type: ['array', 'null'],
                items: {
                    $ref: '#/components/schemas/RawSchemaColumn1',
                },
            },
            parameters: {
                $ref: '#/components/schemas/SubselectParameters',
            },
            connection_id: {
                type: ['string', 'null'],
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id', 'title'],
        title: 'YDB_SUBSELECT',
    },
    DataSource: {
        type: 'object',
        properties: {},
        oneOf: [
            {
                $ref: '#/components/schemas/APPMETRICA_API1',
            },
            {
                $ref: '#/components/schemas/CHYT_TABLE1',
            },
            {
                $ref: '#/components/schemas/CHYT_TABLE_LIST1',
            },
            {
                $ref: '#/components/schemas/CHYT_TABLE_RANGE1',
            },
            {
                $ref: '#/components/schemas/CHYT_SUBSELECT1',
            },
            {
                $ref: '#/components/schemas/CHYT_USER_AUTH_TABLE1',
            },
            {
                $ref: '#/components/schemas/CHYT_USER_AUTH_TABLE_LIST1',
            },
            {
                $ref: '#/components/schemas/CHYT_USER_AUTH_TABLE_RANGE1',
            },
            {
                $ref: '#/components/schemas/CHYT_USER_AUTH_SUBSELECT1',
            },
            {
                $ref: '#/components/schemas/CH_TABLE1',
            },
            {
                $ref: '#/components/schemas/CH_SUBSELECT1',
            },
            {
                $ref: '#/components/schemas/FILE_S3_TABLE1',
            },
            {
                $ref: '#/components/schemas/GP_TABLE1',
            },
            {
                $ref: '#/components/schemas/GP_SUBSELECT1',
            },
            {
                $ref: '#/components/schemas/GSHEETS1',
            },
            {
                $ref: '#/components/schemas/JSON_API1',
            },
            {
                $ref: '#/components/schemas/METRIKA_API1',
            },
            {
                $ref: '#/components/schemas/MSSQL_TABLE1',
            },
            {
                $ref: '#/components/schemas/MSSQL_SUBSELECT1',
            },
            {
                $ref: '#/components/schemas/MYSQL_TABLE1',
            },
            {
                $ref: '#/components/schemas/MYSQL_SUBSELECT1',
            },
            {
                $ref: '#/components/schemas/ORACLE_TABLE1',
            },
            {
                $ref: '#/components/schemas/ORACLE_SUBSELECT1',
            },
            {
                $ref: '#/components/schemas/PG_TABLE1',
            },
            {
                $ref: '#/components/schemas/PG_SUBSELECT1',
            },
            {
                $ref: '#/components/schemas/PROMQL1',
            },
            {
                $ref: '#/components/schemas/SOLOMON1',
            },
            {
                $ref: '#/components/schemas/CH_USAGE_TRACKING_YA_TEAM_TABLE1',
            },
            {
                $ref: '#/components/schemas/YADOCS1',
            },
            {
                $ref: '#/components/schemas/YDB_TABLE1',
            },
            {
                $ref: '#/components/schemas/YDB_SUBSELECT1',
            },
        ],
        discriminator: {
            propertyName: 'source_type',
            mapping: {
                APPMETRICA_API: '#/components/schemas/APPMETRICA_API1',
                CHYT_TABLE: '#/components/schemas/CHYT_TABLE1',
                CHYT_TABLE_LIST: '#/components/schemas/CHYT_TABLE_LIST1',
                CHYT_TABLE_RANGE: '#/components/schemas/CHYT_TABLE_RANGE1',
                CHYT_SUBSELECT: '#/components/schemas/CHYT_SUBSELECT1',
                CHYT_USER_AUTH_TABLE: '#/components/schemas/CHYT_USER_AUTH_TABLE1',
                CHYT_USER_AUTH_TABLE_LIST: '#/components/schemas/CHYT_USER_AUTH_TABLE_LIST1',
                CHYT_USER_AUTH_TABLE_RANGE: '#/components/schemas/CHYT_USER_AUTH_TABLE_RANGE1',
                CHYT_USER_AUTH_SUBSELECT: '#/components/schemas/CHYT_USER_AUTH_SUBSELECT1',
                CH_TABLE: '#/components/schemas/CH_TABLE1',
                CH_SUBSELECT: '#/components/schemas/CH_SUBSELECT1',
                FILE_S3_TABLE: '#/components/schemas/FILE_S3_TABLE1',
                GP_TABLE: '#/components/schemas/GP_TABLE1',
                GP_SUBSELECT: '#/components/schemas/GP_SUBSELECT1',
                GSHEETS: '#/components/schemas/GSHEETS1',
                JSON_API: '#/components/schemas/JSON_API1',
                METRIKA_API: '#/components/schemas/METRIKA_API1',
                MSSQL_TABLE: '#/components/schemas/MSSQL_TABLE1',
                MSSQL_SUBSELECT: '#/components/schemas/MSSQL_SUBSELECT1',
                MYSQL_TABLE: '#/components/schemas/MYSQL_TABLE1',
                MYSQL_SUBSELECT: '#/components/schemas/MYSQL_SUBSELECT1',
                ORACLE_TABLE: '#/components/schemas/ORACLE_TABLE1',
                ORACLE_SUBSELECT: '#/components/schemas/ORACLE_SUBSELECT1',
                PG_TABLE: '#/components/schemas/PG_TABLE1',
                PG_SUBSELECT: '#/components/schemas/PG_SUBSELECT1',
                PROMQL: '#/components/schemas/PROMQL1',
                SOLOMON: '#/components/schemas/SOLOMON1',
                CH_USAGE_TRACKING_YA_TEAM_TABLE:
                    '#/components/schemas/CH_USAGE_TRACKING_YA_TEAM_TABLE1',
                YADOCS: '#/components/schemas/YADOCS1',
                YDB_TABLE: '#/components/schemas/YDB_TABLE1',
                YDB_SUBSELECT: '#/components/schemas/YDB_SUBSELECT1',
            },
        },
    },
    add_source: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            source: {
                $ref: '#/components/schemas/DataSource',
            },
            action: {
                type: 'string',
                const: 'add_source',
            },
        },
        required: ['action', 'source'],
        title: 'add_source',
    },
    update_source: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            source: {
                $ref: '#/components/schemas/DataSource',
            },
            action: {
                type: 'string',
                const: 'add_source',
            },
        },
        required: ['action', 'source'],
        title: 'add_source',
    },
    SourceBase: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
        },
    },
    delete_source: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            source: {
                $ref: '#/components/schemas/SourceBase',
            },
            action: {
                type: 'string',
                const: 'delete_source',
            },
        },
        required: ['action', 'source'],
        title: 'delete_source',
    },
    RefreshSource: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
            force_update_fields: {
                type: 'boolean',
                default: false,
            },
        },
    },
    refresh_source: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            source: {
                $ref: '#/components/schemas/RefreshSource',
            },
            action: {
                type: 'string',
                const: 'refresh_source',
            },
        },
        required: ['action', 'source'],
        title: 'refresh_source',
    },
    SourceAvatar: {
        type: 'object',
        properties: {
            source_id: {
                type: 'string',
            },
            id: {
                type: 'string',
            },
            managed_by: {
                type: ['string', 'null'],
                enum: ['user', 'feature', 'compiler_runtime', null],
            },
            is_root: {
                type: 'boolean',
            },
            valid: {
                type: 'boolean',
                readOnly: true,
            },
            title: {
                type: 'string',
            },
            virtual: {
                readOnly: true,
            },
        },
        required: ['id'],
    },
    add_source_avatar: {
        type: 'object',
        properties: {
            source_avatar: {
                $ref: '#/components/schemas/SourceAvatar',
            },
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'add_source_avatar',
            },
            disable_fields_update: {
                type: 'boolean',
                default: false,
            },
        },
        required: ['action', 'source_avatar'],
        title: 'add_source_avatar',
    },
    update_source_avatar: {
        type: 'object',
        properties: {
            source_avatar: {
                $ref: '#/components/schemas/SourceAvatar',
            },
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'add_source_avatar',
            },
            disable_fields_update: {
                type: 'boolean',
                default: false,
            },
        },
        required: ['action', 'source_avatar'],
        title: 'add_source_avatar',
    },
    AvatarBase: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
        },
    },
    delete_source_avatar: {
        type: 'object',
        properties: {
            source_avatar: {
                $ref: '#/components/schemas/AvatarBase',
            },
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'delete_source_avatar',
            },
            disable_fields_update: {
                type: 'boolean',
                default: false,
            },
        },
        required: ['action', 'source_avatar'],
        title: 'delete_source_avatar',
    },
    add_avatar_relation: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'add_avatar_relation',
            },
            avatar_relation: {
                $ref: '#/components/schemas/AvatarRelation',
            },
        },
        required: ['action', 'avatar_relation'],
        title: 'add_avatar_relation',
    },
    update_avatar_relation: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'add_avatar_relation',
            },
            avatar_relation: {
                $ref: '#/components/schemas/AvatarRelation',
            },
        },
        required: ['action', 'avatar_relation'],
        title: 'add_avatar_relation',
    },
    RelationBase: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
        },
    },
    delete_avatar_relation: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'delete_avatar_relation',
            },
            avatar_relation: {
                $ref: '#/components/schemas/RelationBase',
            },
        },
        required: ['action', 'avatar_relation'],
        title: 'delete_avatar_relation',
    },
    ReplaceConnection: {
        type: 'object',
        properties: {
            new_id: {
                type: 'string',
            },
            id: {
                type: 'string',
            },
        },
        required: ['id', 'new_id'],
    },
    replace_connection: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'replace_connection',
            },
            connection: {
                $ref: '#/components/schemas/ReplaceConnection',
            },
        },
        required: ['action'],
        title: 'replace_connection',
    },
    add_obligatory_filter: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            obligatory_filter: {
                $ref: '#/components/schemas/ObligatoryFilter',
            },
            action: {
                type: 'string',
                const: 'add_obligatory_filter',
            },
        },
        required: ['action', 'obligatory_filter'],
        title: 'add_obligatory_filter',
    },
    update_obligatory_filter: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            obligatory_filter: {
                $ref: '#/components/schemas/ObligatoryFilter',
            },
            action: {
                type: 'string',
                const: 'add_obligatory_filter',
            },
        },
        required: ['action', 'obligatory_filter'],
        title: 'add_obligatory_filter',
    },
    DeleteObligatoryFilter: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
            },
        },
        required: ['id'],
    },
    delete_obligatory_filter: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            obligatory_filter: {
                $ref: '#/components/schemas/DeleteObligatoryFilter',
            },
            action: {
                type: 'string',
                const: 'delete_obligatory_filter',
            },
        },
        required: ['action', 'obligatory_filter'],
        title: 'delete_obligatory_filter',
    },
    Setting: {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                enum: ['load_preview_by_default', 'template_enabled', 'data_export_forbidden'],
            },
            value: {
                type: 'boolean',
            },
        },
        required: ['name', 'value'],
    },
    update_setting: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'update_setting',
            },
            setting: {
                $ref: '#/components/schemas/Setting',
            },
        },
        required: ['action', 'setting'],
        title: 'update_setting',
    },
    update_description: {
        type: 'object',
        properties: {
            order_index: {
                type: 'integer',
                default: 0,
            },
            action: {
                type: 'string',
                const: 'update_description',
            },
            description: {
                type: 'string',
            },
        },
        required: ['action', 'description'],
        title: 'update_description',
    },
    Action: {
        type: 'object',
        properties: {},
        oneOf: [
            {
                $ref: '#/components/schemas/add_field',
            },
            {
                $ref: '#/components/schemas/update_field',
            },
            {
                $ref: '#/components/schemas/delete_field',
            },
            {
                $ref: '#/components/schemas/clone_field',
            },
            {
                $ref: '#/components/schemas/add_source',
            },
            {
                $ref: '#/components/schemas/update_source',
            },
            {
                $ref: '#/components/schemas/delete_source',
            },
            {
                $ref: '#/components/schemas/refresh_source',
            },
            {
                $ref: '#/components/schemas/add_source_avatar',
            },
            {
                $ref: '#/components/schemas/update_source_avatar',
            },
            {
                $ref: '#/components/schemas/delete_source_avatar',
            },
            {
                $ref: '#/components/schemas/add_avatar_relation',
            },
            {
                $ref: '#/components/schemas/update_avatar_relation',
            },
            {
                $ref: '#/components/schemas/delete_avatar_relation',
            },
            {
                $ref: '#/components/schemas/replace_connection',
            },
            {
                $ref: '#/components/schemas/add_obligatory_filter',
            },
            {
                $ref: '#/components/schemas/update_obligatory_filter',
            },
            {
                $ref: '#/components/schemas/delete_obligatory_filter',
            },
            {
                $ref: '#/components/schemas/update_setting',
            },
            {
                $ref: '#/components/schemas/update_description',
            },
        ],
        discriminator: {
            propertyName: 'action',
            mapping: {
                add_field: '#/components/schemas/add_field',
                update_field: '#/components/schemas/update_field',
                delete_field: '#/components/schemas/delete_field',
                clone_field: '#/components/schemas/clone_field',
                add_source: '#/components/schemas/add_source',
                update_source: '#/components/schemas/update_source',
                delete_source: '#/components/schemas/delete_source',
                refresh_source: '#/components/schemas/refresh_source',
                add_source_avatar: '#/components/schemas/add_source_avatar',
                update_source_avatar: '#/components/schemas/update_source_avatar',
                delete_source_avatar: '#/components/schemas/delete_source_avatar',
                add_avatar_relation: '#/components/schemas/add_avatar_relation',
                update_avatar_relation: '#/components/schemas/update_avatar_relation',
                delete_avatar_relation: '#/components/schemas/delete_avatar_relation',
                replace_connection: '#/components/schemas/replace_connection',
                add_obligatory_filter: '#/components/schemas/add_obligatory_filter',
                update_obligatory_filter: '#/components/schemas/update_obligatory_filter',
                delete_obligatory_filter: '#/components/schemas/delete_obligatory_filter',
                update_setting: '#/components/schemas/update_setting',
                update_description: '#/components/schemas/update_description',
            },
        },
    },
    DatasetValidate: {
        type: 'object',
        properties: {
            options: {
                readOnly: true,
                $ref: '#/components/schemas/Options',
            },
            updates: {
                type: 'array',
                items: {
                    $ref: '#/components/schemas/Action',
                },
            },
            dataset: {
                $ref: '#/components/schemas/CleanerDatasetContentInternal',
            },
        },
    },
};
