import type {Dataset, DatasetField, DatasetFieldCalcMode, DatasetFieldError} from '../../../types';
import type {ApiV2RequestBody, ApiV2ResultData} from '../../../types/bi-api/v2';

import type {WorkbookIdArg} from './common';

type Id = {id: string};

type DatasetId = {datasetId: string};

type DatasetVersion = 'draft';

export type ValidateDatasetUpdate = {
    action: string;
    field: Partial<DatasetField>;
};

type DatasetSource = {
    connection_id: string;
    form: Record<string, string>[] | null;
    group: string[];
    is_ref: boolean;
    parameter_hash: string;
    parameters: Record<string, string>;
    ref_source_id: string | null;
    source_type: string;
    title: string;
} & Id;

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
    freeform_sources: DatasetSource[];
    sources: DatasetSource[];
};

export type GetSourceArgs = {
    connectionId: string;
    limit?: number;
} & WorkbookIdArg;

export type DeleteDatasetResponse = unknown;

export type DeleteDatasetArgs = DatasetId;

export type GetDatasetByVersionResponse = Dataset;

export type GetDatasetByVersionArgs = {version: string} & DatasetId & WorkbookIdArg;

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

export type CreateDatasetResponse = Id & DatasetWithOptions;

type CreateDatasetBaseArgs = {
    dataset: Dataset['dataset'];
    multisource: boolean;
    name: string;
    created_via?: string;
};

type CreateDirDatasetArgs = CreateDatasetBaseArgs & {
    dir_path: string;
};

type CreateWorkbookDatsetArgs = CreateDatasetBaseArgs & {
    workbook_id: string;
};

export type CreateDatasetArgs = CreateDirDatasetArgs | CreateWorkbookDatsetArgs;

export type UpdateDatasetResponse = DatasetWithOptions;

export type UpdateDatasetArgs = {
    dataset: Dataset['dataset'];
    version: DatasetVersion;
    multisource: boolean;
} & DatasetId;

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
