import type {ConnectorType} from '../constants';
import type {Permissions} from '../types';

import type {CommonUpdate} from './common-update';

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum DATASET_FIELD_TYPES {
    DATE = 'date',
    GENERICDATETIME = 'genericdatetime',
    DATETIMETZ = 'datetimetz',
    INTEGER = 'integer',
    UINTEGER = 'uinteger',
    STRING = 'string',
    FLOAT = 'float',
    BOOLEAN = 'boolean',
    GEOPOINT = 'geopoint',
    GEOPOLYGON = 'geopolygon',
    MARKUP = 'markup',
    HEATMAP = 'heatmap',
    ARRAY_INT = 'array_int',
    ARRAY_FLOAT = 'array_float',
    ARRAY_STR = 'array_str',
    UNSUPPORTED = 'unsupported',
    // HIERARCHY - the value is used in the client part of the wizard, in the future it will come from the backend.
    HIERARCHY = 'hierarchy',
    TREE_STR = 'tree_str',
    TREE_INT = 'tree_int',
    TREE_FLOAT = 'tree_float',
}

export const DATASET_IGNORED_DATA_TYPES = [
    DATASET_FIELD_TYPES.MARKUP,
    DATASET_FIELD_TYPES.TREE_STR,
    DATASET_FIELD_TYPES.TREE_INT,
    DATASET_FIELD_TYPES.TREE_FLOAT,
    DATASET_FIELD_TYPES.ARRAY_STR,
    DATASET_FIELD_TYPES.ARRAY_INT,
    DATASET_FIELD_TYPES.ARRAY_FLOAT,
];

export const AVAILABLE_FIELD_TYPES = [
    DATASET_FIELD_TYPES.INTEGER,
    DATASET_FIELD_TYPES.STRING,
    DATASET_FIELD_TYPES.FLOAT,
    DATASET_FIELD_TYPES.BOOLEAN,
    DATASET_FIELD_TYPES.DATE,
    DATASET_FIELD_TYPES.GENERICDATETIME,
] as const;

export const COMMON_FIELD_TYPES = [
    DATASET_FIELD_TYPES.ARRAY_FLOAT,
    DATASET_FIELD_TYPES.ARRAY_INT,
    DATASET_FIELD_TYPES.ARRAY_STR,
    DATASET_FIELD_TYPES.DATE,
    DATASET_FIELD_TYPES.FLOAT,
    DATASET_FIELD_TYPES.GENERICDATETIME,
    DATASET_FIELD_TYPES.GEOPOINT,
    DATASET_FIELD_TYPES.GEOPOLYGON,
    DATASET_FIELD_TYPES.INTEGER,
    DATASET_FIELD_TYPES.MARKUP,
    DATASET_FIELD_TYPES.STRING,
    DATASET_FIELD_TYPES.UNSUPPORTED,
] as const;

export type AvailableFieldType = (typeof AVAILABLE_FIELD_TYPES)[number];
export type CommonFieldType = (typeof COMMON_FIELD_TYPES)[number];

export enum DatasetFieldAggregation {
    None = 'none',
    Sum = 'sum',
    Avg = 'avg',
    Min = 'min',
    Max = 'max',
    Count = 'count',
    Countunique = 'countunique',
}

export type DatasetFieldCalcMode = 'formula' | 'direct' | 'parameter';

export enum DatasetFieldType {
    Dimension = 'DIMENSION',
    Measure = 'MEASURE',
    Pseudo = 'PSEUDO',
    Parameter = 'PARAMETER',
}

export type DatasetComponentError = {
    id: string;
    type: 'data_source' | 'field';
    errors: DatasetComponentErrorItem[];
};

export type DatasetComponentErrorItem = {
    code: string;
    level: string;
    message: string;
    details: {
        db_message?: string;
        query?: string;
    };
};

export interface Dataset {
    id: string;
    realName: string;
    is_favorite: boolean;
    key: string;
    options: DatasetOptions;
    dataset: {
        avatar_relations: DatasetAvatarRelation[];
        component_errors: {
            items: DatasetComponentError[];
        };
        obligatory_filters: ObligatoryFilter[];
        preview_enabled: boolean;
        result_schema: DatasetField[];
        result_schema_aux: {
            inter_dependencies: {
                deps: string[];
            };
        };
        rls: {[key: string]: string};
        rls2: {[key: string]: string};
        source_avatars: DatasetSourceAvatar[];
        source_features?: {};
        sources: DatasetSource[];
        revisionId?: string;
        load_preview_by_default: boolean;
        template_enabled: boolean;
        data_export_forbidden?: boolean;
        description?: string;
    };
    workbook_id?: string;
    permissions?: Permissions;

    // This part of the fields moved to the dataset field. right here saved for backward compatibility
    avatar_relations: DatasetAvatarRelation[];
    component_errors: {items: DatasetComponentError[]};
    preview_enabled: boolean;
    raw_schema?: DatasetRawSchema[];
    result_schema?: DatasetField[];
    rls: {[key: string]: string};
    source_avatars: DatasetSourceAvatar[];
    source_features: {};
    sources: DatasetSource[];
}

export interface ObligatoryFilter {
    id: string;
    field_guid: string;
    managed_by: string;
    valid: boolean;
    default_filters: ObligatoryDefaultFilter[];
}

export interface ObligatoryDefaultFilter {
    column: string;
    operation: string;
    values: string[];
}

export const DATASET_VALUE_CONSTRAINT_TYPE = {
    DEFAULT: 'default',
    NULL: 'null',
    REGEX: 'regex',
} as const;

export type DatasetValueConstraintType =
    (typeof DATASET_VALUE_CONSTRAINT_TYPE)[keyof typeof DATASET_VALUE_CONSTRAINT_TYPE];

export interface DatasetField {
    aggregation: DatasetFieldAggregation;
    type: DatasetFieldType;
    calc_mode: DatasetFieldCalcMode;
    default_value: ParameterDefaultValue | null;
    initial_data_type: DATASET_FIELD_TYPES;
    // type before aggregation
    cast: DATASET_FIELD_TYPES;
    // final type
    data_type: DATASET_FIELD_TYPES;
    description: string;
    guid: string;
    title: string;
    managed_by: string;
    source: string;
    avatar_id: string;
    formula?: string;
    guid_formula?: string;
    has_auto_aggregation: boolean;
    aggregation_locked: boolean;
    lock_aggregation: boolean;
    virtual: boolean;
    valid: boolean;
    hidden: boolean;
    autoaggregated: boolean;
    template_enabled?: boolean;
    value_constraint?:
        | {type: typeof DATASET_VALUE_CONSTRAINT_TYPE.DEFAULT}
        | {type: typeof DATASET_VALUE_CONSTRAINT_TYPE.NULL}
        | {type: typeof DATASET_VALUE_CONSTRAINT_TYPE.REGEX; pattern: string}
        | null;
    ui_settings?: string;
}

export interface DatasetFieldError {
    guid: string;
    title: string;
    errors: {
        column: number | null;
        row: number | null;
        message: string;
    }[];
}

export type DatasetUpdate = CommonUpdate<DatasetField>;

export type DatasetOptionDataTypeItem = {
    aggregations: DatasetFieldAggregation[];
    casts: DATASET_FIELD_TYPES[];
    type: string;
    filter_operations: string[];
};

export type DatasetOptionFieldItem = {
    aggregations: DatasetFieldAggregation[];
    casts: DATASET_FIELD_TYPES[];
    guid: string;
};

export interface DatasetOptions {
    connections: {
        compatible_types: string[];
        items: {
            id: string;
            replacement_types: {
                conn_type: ConnectorType;
            }[];
        }[];
        max: number;
    };
    syntax_highlighting_url: string;
    sources: {
        compatible_types: string[];
        items: {
            schema_update_enabled: boolean;
            id: string;
        }[];
    };
    preview: {
        enabled: boolean;
    };
    source_avatars: {
        items: {
            schema_update_enabled: boolean;
            id: string;
        }[];
        max: number;
    };
    schema_update_enabled: boolean;
    supports_offset: boolean;
    supported_functions: string[];
    data_types: {items: DatasetOptionDataTypeItem[]};
    fields: {items: DatasetOptionFieldItem[]};
    join: {
        types: string[];
        operators: string[];
    };
}

export type DatasetRawSchema = {
    user_type: string;
    name: string;
    title: string;
    description: string;
    nullable: boolean;
    lock_aggregation: boolean;
    has_auto_aggregation: boolean;
    native_type: {
        name: string;
        conn_type?: string;
    };
};

export interface DatasetSource {
    id: string;
    connection_id: string;
    ref_source_id?: string | null;
    name?: string;
    title: string;
    source_type: string;
    managed_by: string;
    parameter_hash: string;
    valid: boolean;
    is_ref?: boolean;
    virtual: boolean;
    raw_schema: DatasetRawSchema[];
    group?: string[];
    parameters: {
        table_name?: string;
        db_version?: string;
        db_name?: string | null;
    };
}

export interface DatasetSourceAvatar {
    id: string;
    title: string;
    source_id: string;
    managed_by: string;
    valid: boolean;
    is_root: boolean;
    virtual: boolean;
}

export interface DatasetAvatarRelation {
    id: string;
    join_type: string;
    left_avatar_id: string;
    right_avatar_id: string;
    managed_by: string;
    virtual: boolean;
    conditions: DatasetAvatarRelationCondition[];
    required: boolean;
}

export interface DatasetAvatarRelationCondition {
    operator: string;
    type: string;
    left: {
        calc_mode: string;
        source: string | null;
    };
    right: {
        calc_mode: string;
        source: string | null;
    };
}

export interface DatasetApiError {
    datasetId: string;
    error: {
        code?: string;
        message?: string;
    };
}

export type DatasetSelectionMap = Record<DatasetField['guid'], true>;

export type ParameterDefaultValue = string | number | boolean | null;
export type DatasetRls = {[key: string]: string};
