import type {ApiV2Annotations} from '../../constants';
import type {DatasetUpdate, ParameterDefaultValue} from '../dataset';
import type {Update} from '../wizard';

export type ApiV2Request = {
    url: string;
    method: 'POST' | 'GET';
    data: ApiV2RequestBody;
    ui?: boolean;
    cache?: number;
};
export type ApiV2ResultDataRow = {data: string[]; legend: number[]};
export type ApiV2ResultData = {
    result_data: {
        rows: ApiV2ResultDataRow[];
    }[];
    fields: ApiV2ResponseField[];
    blocks: {
        query: string;
    }[];
    data_export: ApiV2DataExportField;
    data_export_forbidden?: boolean;
    pivot_data?: unknown;
    notifications?: unknown[];
};

export type ApiV2DataExportField = {
    background: ApiV2DataExport;
    basic: ApiV2DataExport;
};
export type ApiV2DataExport = {
    reason: null | ApiV2DataExportForbiddenReason[];
    allowed: boolean;
};

const API_V2_DATA_EXPORT_FORBIDDEN_REASONS = [
    'DISABLED_EXPORT_DATASET',
    'DISABLED_EXPORT_CONNECTION',
    'DISABLED_EXPORT_TENANT',
    'PROHIBITED_EXPORT_TENANT',
    'PROHIBITED_EXPORT_CONNECTION',
    'PROHIBITED_EXPORT_PIVOT_TABLE',
    'PROHIBITED_EXPORT_QL_CHART',
    'PROHIBITED_EXPORT_TYPED_QUERY',
] as const;

type ApiV2DataExportForbiddenReason = (typeof API_V2_DATA_EXPORT_FORBIDDEN_REASONS)[number];

export type ApiV2ResultField = {
    data_type: string;
    field_type: string;
    id: string;
    item_type: string;
    legend_item_id: number;
    role_spec: {role: string};
    title: string;
};

export type ApiV2RequestField = {
    ref: ApiV2Ref;
    block_id?: number;
    legend_item_id?: number;
    role_spec?: ApiV2RequestFieldRoleSpec;
};
export type ApiV2RequestFieldRoleSpec = {
    role: string;
    annotation_type?: ApiV2Annotations;
    level?: number;
    template?: string;
    prefix?: string;
    dimension_values?: {legend_item_id: number; value: string}[];
    range_type?: 'min' | 'max';
    direction?: string;

    target_legend_item_ids?: number[];
};
export type ApiV2RequestPivotRoleSpec = {sorting?: ApiV2RequestFieldSorting} & Pick<
    ApiV2RequestFieldRoleSpec,
    'annotation_type' | 'role' | 'direction' | 'target_legend_item_ids'
>;
export type ApiV2PivotRequestStructure = {
    legend_item_ids: number[];
    role_spec?: ApiV2RequestPivotRoleSpec;
};
export type ApiV2RequestPivot = {
    structure: ApiV2PivotRequestStructure[];
    with_totals?: boolean;
    totals?: ApiV2RequestPivotTotals;
    pagination: ApiV2RequestPivotPagination;
};
export type ApiV2RequestPivotPagination = {
    offset_rows: number | undefined;
    limit_rows: number | undefined;
};
export type ApiV2ResponseField = {
    id?: string;
    title: string;
    data_type: string;
    ref: ApiV2Ref;
    block_id?: number;
    legend_item_id?: number;
    role_spec?: {
        role: string;
        level?: number;
        template?: string;
        prefix?: string;
        dimension_values?: {legend_item_id: number; value: string}[];
    };
};
export type ApiV2Filter = {
    ref: ApiV2Ref;
    operation: string;
    values: string[];
    role_spec?: ApiV2RoleSpec;
};
export type ApiV2OrderBy = {
    ref: ApiV2Ref;
    direction: string;
    role_spec?: ApiV2RoleSpec;
};
export type ApiV2RoleSpec = {
    role: string;
};
export type ApiV2Ref =
    | {
          type: 'id';
          id: string;
      }
    | {
          type: 'title';
          title: string;
      }
    | {
          type: 'measure_name';
      }
    | {
          type: 'placeholder';
      };
export type ApiV2Parameter = {
    ref: ApiV2Ref;
    value: ParameterDefaultValue;
    block_id?: number;
};
export type ApiV2RequestBody = {
    fields: ApiV2RequestField[];
    filters?: ApiV2Filter[];
    parameter_values?: ApiV2Parameter[];
    order_by?: ApiV2OrderBy[];
    updates?: Update[] | DatasetUpdate[];
    ignore_nonexistent_filters?: boolean;
    disable_group_by?: boolean;
    limit?: number;
    offset?: number;
    with_totals?: boolean;
    autofill_legend?: boolean;
    dataset_revision_id?: string;
};
export type ApiV2RequestBodyPivot = Omit<ApiV2RequestBody, 'with_totals'> & {
    pivot: ApiV2RequestPivot;
    pivot_pagination: ApiV2RequestPivotPagination;
};
export type ApiV2RequestFieldSortingSettings = {
    header_values: Array<{value: string}>;
    role_spec: {
        role: 'data' | 'total';
    };
    direction: 'asc' | 'desc';
};
export type ApiV2RequestFieldSorting = {
    column?: ApiV2RequestFieldSortingSettings;
    row?: ApiV2RequestFieldSortingSettings;
};
export type ApiV2RequestPivotTotalsSettings = {
    level: number;
};
export type ApiV2RequestPivotTotals = {
    columns: ApiV2RequestPivotTotalsSettings[];
    rows: ApiV2RequestPivotTotalsSettings[];
};

export type FieldRoleSpec = 'distinct' | 'range';

export type ApiV2BackgroundSettingsGuids = {
    colorFieldGuid: string;
    targetFieldGuid: string;
    isContinuous: boolean;
};
