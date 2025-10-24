import React from 'react';

import {debounce} from 'lodash';
import type {FileSourcePreview, FileSourceSchema} from 'shared/schema';
import type {CommonTableColumn, TableCellsRow} from 'shared/types/chartkit/table';
import type {TableWidgetData} from 'ui/libs/DatalensChartkit/types';
import {
    getFileSourcePreviewTableColumns,
    getFileSourcePreviewTableRows,
} from 'ui/units/connections/components/custom-forms/utils/render';

export type FileSourcePreviewTableColumn = Omit<CommonTableColumn, 'custom'> &
    Required<
        Pick<
            CommonTableColumn<{
                originalIndex: number;
            }>,
            'custom'
        >
    >;

type GetColumnsType = {
    getColumns: () => FileSourcePreviewTableColumn[];
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
const COLUMN_FILTER_CHANGE_DEBOUNCE_RATE = 500;

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

    const columns = React.useMemo(() => {
        if (typeof getColumns === 'function') {
            return getColumns();
        }

        return getFileSourcePreviewTableColumns({
            schema: fileSourceSchema,
            filter: internalColumnFilterValue || '',
        });
    }, [fileSourceSchema, internalColumnFilterValue, getColumns]);

    const rows = React.useMemo(() => {
        if (columns.length < 1) {
            return EMPTY_ARRAY;
        }

        return getFileSourcePreviewTableRows({columns, fileSourcePreview});
    }, [columns, fileSourcePreview]);

    return React.useMemo(() => {
        return {
            data: {
                head: columns,
                rows,
                preserveWhiteSpace: true,
            },
            params: {},
            type: 'table',
            controls: {
                controls: [],
            },
        };
    }, [columns, rows]) as TableWidgetData;
};
