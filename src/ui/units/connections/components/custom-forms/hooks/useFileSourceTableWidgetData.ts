import React from 'react';

import {debounce} from 'lodash';
import type {FileSourcePreview, FileSourceSchema} from 'shared/schema';
import type {TableCellsRow, TableHead} from 'shared/types/chartkit/table';
import type {TableWidgetData} from 'ui/libs/DatalensChartkit/types';
import {
    getFileSourcePreviewTableColumns,
    getFileSourcePreviewTableRows,
} from 'ui/units/connections/components/custom-forms/utils/render';

type GetColumnsType = {
    getColumns: () => TableHead[];
    fileSourceSchema?: never;
    columnFilterValue?: never;
};

type FilePreviewType = {
    fileSourceSchema: FileSourceSchema;
    columnFilterValue: string;
    getColumns?: never;
};

type UseFileSourceTableDataParams = {
    fileSourcePreview: FileSourcePreview;
} & (GetColumnsType | FilePreviewType);

const EMPTY_ARRAY: TableCellsRow[] = [];
const COLUMN_FILTER_CHANGE_DEBOUNCE_RATE = 200;

export const useFileSourceTableWidgetData = ({
    fileSourcePreview,
    fileSourceSchema,
    columnFilterValue,
    getColumns,
}: UseFileSourceTableDataParams): TableWidgetData => {
    const [internalColumnFilterValue, setInternalColumnFilterValue] =
        React.useState(columnFilterValue);

    const debouncedSetInternalColumnFilterValue = React.useMemo(
        () => debounce(setInternalColumnFilterValue, COLUMN_FILTER_CHANGE_DEBOUNCE_RATE),
        [],
    );

    React.useEffect(() => {
        debouncedSetInternalColumnFilterValue(columnFilterValue);
    }, [columnFilterValue, debouncedSetInternalColumnFilterValue]);

    const columns =
        typeof getColumns === 'function'
            ? getColumns()
            : getFileSourcePreviewTableColumns({
                  schema: fileSourceSchema,
                  filter: internalColumnFilterValue || '',
              });

    const rows =
        columns.length < 1
            ? EMPTY_ARRAY
            : getFileSourcePreviewTableRows({columns, fileSourcePreview});

    const tableWidgetData: TableWidgetData = {
        data: {
            head: columns,
            rows,
        },
        params: {},
        type: 'table',
        controls: {
            controls: [],
        },
    };

    return tableWidgetData;
};
