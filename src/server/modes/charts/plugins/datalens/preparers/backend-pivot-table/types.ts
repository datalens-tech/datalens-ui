import type {
    ApiV2Annotations,
    ApiV2RequestPivotRoleSpec,
    BarTableCell,
    BarViewOptions,
    ColumnSettings,
    CommonTableColumn,
    DATASET_FIELD_TYPES,
    MarkupItem,
    ServerField,
    TableFieldBackgroundSettings,
} from '../../../../../../../shared';
import type {BackendPivotTableCellCustom} from '../../types';

export type PivotDataWithInfo = {
    columns: PivotDataColumn[];
    columns_with_info: Array<{cells: PivotDataColumn; header_info: HeaderInfo}>;
    rows: PivotDataRowsWithInfo[];
    row_dimension_headers?: PivotRowDimensionHeaders[];
    order: any[];
};

export type PivotData = {
    columns: PivotDataColumn[];
    rows: PivotDataRows[];
    row_dimension_headers?: PivotRowDimensionHeaders[];
    order: any[];
};

export type PivotField = {
    data_type: DATASET_FIELD_TYPES;
    field_type: 'DIMENSION' | 'MEASURE';
    id: string;
    item_type: string;
    legend_item_id: number;
    role_spec: {role: string};
    title: string;
};

export type PivotDataStructure = {
    title: string;
    legend_item_ids: number[];
    pivot_item_id: number;
    role_spec: ApiV2RequestPivotRoleSpec;
};

export type PivotDataTotal = {
    level: number;
};

export type PivotDataTotals = {
    columns: PivotDataTotal[];
    rows: PivotDataTotal[];
};

export type PivotDataColumn = PivotDataCellValues[];

export type PivotDataCellValues = PivotDataCellValue[];

export type PivotRowDimensionHeaders = PivotDataCellValue[];

export type CellValue = string;

export type LegendItemId = number;

export type PivotItemId = number;

export type PivotDataCellValue = [CellValue, LegendItemId, PivotItemId];

export type HeaderInfo = {
    role_spec: {
        role: 'data' | 'total';
    };
    sorting_direction: 'asc' | 'desc' | null;
};

export type PivotDataRowsWithInfo = PivotDataRows & {
    header_with_info: {cells: PivotDataRowsHeader[]; header_info: HeaderInfo};
};

export type PivotDataRows = {
    header: PivotDataRowsHeader[];
    values: PivotDataRowsValue[];
};

export type PivotDataRowsHeader = PivotDataCellValue[] | null;

export type PivotDataRowsValue = PivotDataCellValue[] | null;

export type CharkitTableHead = any[];
export type ChartkitTableRows = any[];

export type ChartkitHeadCell = {
    id?: number | string;
    name?: string;
    formattedName?: string;
    autogroup?: boolean;
    group?: boolean;
    type?: 'number' | 'markup' | 'date';
    sortable?: boolean;
    sub?: ChartkitHeadCell[];
    markup?: MarkupItem;
    css?: CommonTableColumn['css'];
    width?: CommonTableColumn['width'];
    allowGroupSort?: boolean;
    custom?: BackendPivotTableCellCustom;
    isTotalCell?: boolean;
};

export type ChartkitCell = {
    id?: string;
    // Used to sort the table on the client.
    value?: number | string | null;
    colorKey?: string;
    barColor?: string;
    // Used for line headers.
    formattedValue?: string;
    css?:
        | ({
              fontSize: string;
              minHeight: string;
              lineHeight: string;
          } & CommonTableColumn['css'])
        | CommonTableColumn['css'];
    isTotalCell?: boolean;
    header?: boolean;
    type?: CommonTableColumn['type'];
} & Omit<Partial<BarTableCell>, 'type'>;

export type PivotTableColumnSettingsDict = {
    column?: ColumnSettings;
    row?: ColumnSettings;
};

export type PivotTableFieldSettings = {
    columnSettings?: PivotTableColumnSettingsDict;
    barsSettings?: {options: BarViewOptions; columnValues: (string | null)[]};

    backgroundSettings?: TableFieldBackgroundSettings;
};

export type PivotTableFieldDict = {
    fieldDict: Record<string, ServerField>;
    settingsByField: Record<string, PivotTableFieldSettings>;
};

export type PivotTableHeaderSortMeta = {
    columnsMeta: Record<number, HeaderInfo>;
    rowsMeta: Record<number, HeaderInfo>;
};

export type PivotTableSortSettings = {
    isSortByRowAllowed: boolean;
    isSortByColumnAllowed: boolean;
} & PivotTableHeaderSortMeta;

export type AnnotationsMap = Record<PivotItemId, ApiV2Annotations>;
