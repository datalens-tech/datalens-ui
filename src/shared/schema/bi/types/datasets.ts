import type z from 'zod/v4';

import type {
    Dataset,
    DatasetField,
    DatasetFieldCalcMode,
    DatasetFieldError,
    TransferIdMapping,
    TransferNotification,
} from '../../../types';
import type {ApiV2RequestBody, ApiV2ResultData} from '../../../types/bi-api/v2';
import type {EntryFieldData} from '../../types';
import type {createDatasetResultSchema, deleteDatasetResultSchema} from '../schemas';

import type {WorkbookIdArg} from './common';

type Id = {id: string};

type DatasetId = {datasetId: string};

type DatasetVersion = 'draft';

export type ValidateDatasetUpdate = {
    action: string;
    field: Partial<DatasetField>;
};

type FieldDocKey =
    | 'CHYT_TABLE/table_name'
    | 'CHYT_TABLE_LIST/table_names'
    | 'CHYT_TABLE_LIST/title'
    | 'CHYT_TABLE_RANGE/title'
    | 'CHYT_USER_AUTH_TABLE_LIST/title'
    | 'CHYT_USER_AUTH_TABLE_RANGE/title'
    | 'CHYT_USER_AUTH_TABLE/table_name'
    | 'CHYT_USER_AUTH_TABLE/table_names'
    | 'CHYT_TABLE_RANGE/directory_path'
    | 'CHYDB_TABLE/table_name'
    | 'CHYDB_TABLE/ydb_database'
    | 'ANY_SUBSELECT/subsql'
    | 'CHYT_SUBSELECT/subsql'
    | 'MSSQL_SUBSELECT/subsql'
    | 'PG_SUBSELECT/subsql'
    | 'YTsaurus/CHYT_TABLE/table_name'
    | 'CHYT_YTSAURUS_TABLE_LIST/title'
    | 'YTsaurus/CHYT_TABLE_LIST/table_names'
    | 'CHYT_YTSAURUS_TABLE_RANGE/title'
    | 'YTsaurus/CHYT_TABLE_RANGE/directory_path'
    | 'YTsaurus/CHYT_SUBSELECT/subsql';

type BaseOptions = {
    name: string;
    default: string;
    title: string;
    required?: boolean;
    field_doc_key?: FieldDocKey;
    template_enabled?: boolean;
};

export type TextFormOptions = {input_type: 'text'} & BaseOptions;

export type TextareaFormOptions = {input_type: 'textarea'} & BaseOptions;

type SqlFormOptions = {input_type: 'sql'} & BaseOptions;

export type SelectFormOptions = {
    input_type: 'select';
    select_options: string[];
    select_allow_user_input: boolean;
} & BaseOptions;

export type FormOptions =
    | TextFormOptions
    | TextareaFormOptions
    | SqlFormOptions
    | SelectFormOptions;

export type BaseSource = {
    connection_id: string;
    form: FormOptions[];
    disabled: boolean;
    group: string[];
    is_ref: boolean;
    parameter_hash: string;
    parameters: Record<string, string>;
    ref_source_id: string | null;
    source_type: string;
    title: string;
    managed_by?: 'user';
    tab_title: string;
};

type DatasetWithOptions = {
    dataset: Dataset['dataset'];
    options: Dataset['options'];
};

type DistinctResultData = {
    Data: string[][];
    Type: [string, [string, [string, [string, string[]]][]]];
};

export type DistinctResult = {result: {data: DistinctResultData}};
export type DistinctRegularResult = {result: {regular: DistinctResultData}};

export type DatasetDistinctWhere = {
    column: string;
    operation: string;
    values: string[];
};

export type GetSourceResponse = {
    freeform_sources: BaseSource[];
    sources: BaseSource[];
};

export type GetSourceArgs = {
    connectionId: string;
    limit?: number;
    offset?: number;
    db_name?: string;
    search_text?: string;
} & WorkbookIdArg;

export type DeleteDatasetResponse = z.infer<typeof deleteDatasetResultSchema>;

export type CheckDatasetsForPublicationResponse = {
    result: {
        allowed: boolean;
        dataset_id: string;
        reason: string | null;
    }[];
};

export type CheckDatasetsForPublicationArgs = {
    datasetsIds: string[];
} & WorkbookIdArg;

export type CheckConnectionsForPublicationResponse = {
    result: {
        allowed: boolean;
        connection_id: string;
        reason: string | null;
    }[];
};

export type CheckConnectionsForPublicationArgs = {
    connectionsIds: string[];
} & WorkbookIdArg;

export type ValidateDatasetErrorResponse = {
    code: string;
    message: string;
    details: {data: {dataset_errors: []} & DatasetWithOptions};
};

export type ValidateDatasetResponse = {
    code: string;
    message: string;
    dataset_errors: string[];
} & DatasetWithOptions;

export type ValidateDatasetArgs = {
    dataset: Partial<Dataset['dataset']>;
    updates: ValidateDatasetUpdate[];
    version: DatasetVersion;
} & DatasetId &
    WorkbookIdArg;

export type GetFieldTypesResponse = {
    types: {
        name: string;
        aggregations: string[];
    }[];
};

export type PartialDatasetField = {
    data_type: string;
    guid: string;
    hidden: boolean;
    title: string;
    type: string;
    calc_mode: DatasetFieldCalcMode;
};

export type GetDataSetFieldsByIdResponse = {
    fields: PartialDatasetField[];
    revision_id: string;
};

export type GetDataSetFieldsByIdArgs = WorkbookIdArg & {
    dataSetId: string;
};

export type CreateDatasetResponse = z.infer<typeof createDatasetResultSchema>;

export type GetPreviewResponse = Partial<DistinctResult & DistinctRegularResult>;

export type GetPreviewArgs = {
    dataset: Dataset['dataset'];
    version: DatasetVersion;
    limit?: number;
} & DatasetId &
    WorkbookIdArg;

export type ValidateDatasetFormulaErrorResponse = {
    code: string;
    message: string;
    details: {data: {field_errors: DatasetFieldError[]}};
};

export type ValidateDatasetFormulaResponse = {
    code: string;
    field_errors: DatasetFieldError[];
    message: string;
};

export type ValidateDatasetFormulaArgs = {
    dataset: Dataset['dataset'];
    field: DatasetField;
} & DatasetId &
    WorkbookIdArg;

export type CopyDatasetResponse = Id;

export type CopyDatasetArgs = {new_key: string} & DatasetId;

export type GetDistinctsResponse = DistinctResult;

export type GetDistinctsApiV2Response = ApiV2ResultData;

export type GetDistinctsApiV2TransformedResponse = {
    result: {
        data: {
            Data: GetDistinctsResponse['result']['data']['Data'];
        };
    };
};

export type GetDistinctsApiV2InfoHeadersArg = Record<string, string>;

export type GetDistinctsApiV2Args = Omit<
    ApiV2RequestBody,
    'pivot' | 'order_by' | 'disable_group_by' | 'with_totals' | 'autofill_legend'
> &
    DatasetId &
    WorkbookIdArg;

export type ExportDatasetResponse = {
    dataset: EntryFieldData;
    notifications: TransferNotification[];
};

export type ExportDatasetArgs = {
    datasetId: string;
    idMapping: TransferIdMapping;
    workbookId?: string | null;
};

export type ImportDatasetResponse = {
    id: string;
    notifications: TransferNotification[];
};

export type ImportDatasetArgs = {
    workbookId: string;
    dataset: EntryFieldData;
    idMapping: TransferIdMapping;
};

export type GetDbNamesResponse = {
    db_names: string[];
};
