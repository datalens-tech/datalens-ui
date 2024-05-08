import {
    ApiV2BackgroundSettingsGuids,
    ApiV2RequestField,
    ApiV2RequestPivotTotals,
    ServerColor,
    ServerField,
    StringParams,
} from '../../../../../../../../../shared';

export type GetRegularFieldsArgs = {
    columns: ServerField[];
    rows: ServerField[];
    measures: ServerField[];
    orderByMap: Record<string, string>;
    legendItemCounter: {
        legendItemIdIndex: number;
    };
};

export type GetPivotStructureArgs = {
    columnsReq: ApiV2RequestField[];
    measuresReq: ApiV2RequestField[];
    rowsReq: ApiV2RequestField[];
    annotations: ApiV2RequestField[];
    params: StringParams;
    totals?: ApiV2RequestPivotTotals;
};

export type GetAnnotationsArgs = {
    colors: ServerColor[];
    backgroundColors: ApiV2BackgroundSettingsGuids[];
    legendItemCounter: {
        legendItemIdIndex: number;
    };
    orderByMap: Record<string, string>;
    usedFieldsMap: Record<
        string,
        {
            legendItemId: number;
            role: string;
        }
    >;
};

export type GetStructureWithSortingFromFieldArgs = {
    field: ApiV2RequestField;
    params: StringParams;
    columnsReq: ApiV2RequestField[];
    rowsReq: ApiV2RequestField[];
    measuresReq: ApiV2RequestField[];
    totals?: ApiV2RequestPivotTotals;
};

export type GetTotalsForPivotArgs = {
    columnsFields: ServerField[];
    rowsFields: ServerField[];
};
