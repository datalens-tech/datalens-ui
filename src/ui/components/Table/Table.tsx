import React from 'react';

import {
    ColumnDef,
    OnChangeFn,
    PaginationState,
    RowData,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import block from 'bem-cn-lite';
import isUndefined from 'lodash/isUndefined';
import {Bar} from 'ui/components/Table/components/Bar/Bar';
import {selectBarSettingValue} from 'ui/libs/DatalensChartkit/ChartKit/components/Widget/components/Table/utils/misc';

import {Paginator} from './components/Paginator/Paginator';
import {SortIcon} from './components/SortIcon/SortIcon';

import './Table.scss';

declare module '@tanstack/react-table' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface ColumnMeta<TData extends RowData, TValue> {
        width?: string;
    }
}

const b = block('dl-table');

type TableProps = {
    title?: {text: string};
    data: {
        head?: any[];
        rows?: any[];
        footer?: any[];
    };
    width?: number;
    height?: number;
    emptyDataMsg?: string;
    pagination: {
        enabled: boolean;
        pageIndex: number;
        pageSize: number;
    };
    onChange: any;
};

type TData = {
    value: any;
    formattedValue?: string;
    fieldId?: string;
    css?: React.CSSProperties;
    barColor?: string;
}[];

function getTableData(args: TableProps['data']) {
    const {head = [], footer = [], rows = []} = args;
    const footerData = footer[0]?.cells;
    const columnHelper = createColumnHelper<TData>();
    const columns: ColumnDef<TData>[] = head.map((headCell: any, index: number) => {
        const options: ColumnDef<TData> = {
            id: headCell.id,
            header: headCell.name,
            enableSorting: true,
            footer: footerData?.[index]?.value,
            meta: {
                width: headCell.width,
            },
        };

        const renderBarCell = (cellData: any) => {
            if (!cellData) {
                return null;
            }

            const min = isUndefined(cellData.min) ? headCell.min : cellData.min;
            const max = isUndefined(cellData.max) ? headCell.max : cellData.max;

            return (
                <Bar
                    value={cellData.value}
                    formattedValue={cellData.formattedValue}
                    align={headCell.align || cellData.align}
                    barHeight={headCell.barHeight || cellData.barHeight}
                    min={min}
                    max={max}
                    showLabel={selectBarSettingValue(headCell, cellData, 'showLabel')}
                    showSeparator={selectBarSettingValue(headCell, cellData, 'showSeparator')}
                    debug={selectBarSettingValue(headCell, cellData, 'debug')}
                    color={cellData.barColor}
                    showBar={cellData.showBar}
                    offset={cellData.offset}
                />
            );
        };

        if (headCell.view === 'bar') {
            options.cell = (context) => {
                const cellData = context.row.original[index] as any;
                return renderBarCell(cellData);
            };

            options.footer = () => {
                return renderBarCell(footerData?.[index]);
            };
        }

        return columnHelper.accessor((row) => {
            const cellData = row[index];
            return cellData.formattedValue ?? cellData.value;
        }, options);
    });

    const data: TData[] = rows?.map((row: any) => row.cells) || [];

    return {columns, data};
}

export const Table = (props: TableProps) => {
    const {title} = props;
    const {columns, data} = React.useMemo(() => getTableData(props.data), [props.data]);
    const shouldShowFooter = columns.some((column) => column.footer);
    const paginationState: PaginationState = {
        pageIndex: props.pagination.pageIndex,
        pageSize: props.pagination.pageSize,
    };

    const handlePaginationChange: OnChangeFn<PaginationState> = (updater) => {
        const newPaginationState =
            typeof updater === 'function' ? updater(paginationState) : updater;

        if (props.onChange) {
            const _page = String(newPaginationState.pageIndex);
            props.onChange(
                {type: 'PARAMS_CHANGED', data: {params: {_page}}},
                {forceUpdate: true},
                true,
            );
        }
    };

    const isPaginationEnabled = props.pagination.enabled;
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        ...(isPaginationEnabled
            ? {
                  manualPagination: true,
                  state: {
                      pagination: paginationState,
                  },
                  onPaginationChange: handlePaginationChange as OnChangeFn<PaginationState>,
              }
            : {}),
    });

    const rows = table.getRowModel().rows;
    return (
        <div className={b()}>
            {title && <div className={b('title')}>{title.text}</div>}
            <table className={b('table')}>
                <thead className={b('header')}>
                    {table.getHeaderGroups().map((headerGroup) => {
                        if (!headerGroup.headers.length) {
                            return null;
                        }

                        return (
                            <tr key={headerGroup.id} className={b('tr')}>
                                {headerGroup.headers.map((header) => {
                                    const width = header.column.columnDef.meta?.width;
                                    const isFixedSize = Boolean(width);

                                    return (
                                        <th
                                            key={header.id}
                                            className={b('th', {
                                                clickable: header.column.getCanSort(),
                                                'fixed-size': isFixedSize,
                                            })}
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{width}}
                                        >
                                            <div className={b('th-content')}>
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                          header.column.columnDef.header,
                                                          header.getContext(),
                                                      )}
                                                <SortIcon sorting={header.column.getIsSorted()} />
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </thead>
                <tbody className={b('body')}>
                    {rows.map((row) => (
                        <tr key={row.id} className={b('tr')}>
                            {row.getVisibleCells().map((cell, index) => {
                                const width = cell.column.columnDef.meta?.width;
                                const isFixedSize = Boolean(width);
                                const originalCellData = cell.row.original[index];

                                return (
                                    <td
                                        key={cell.id}
                                        className={b('td')}
                                        style={originalCellData?.css}
                                    >
                                        <div
                                            className={b('td-content', {
                                                'fixed-size': isFixedSize,
                                            })}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </div>
                                    </td>
                                );
                            })}
                        </tr>
                    ))}
                    {!rows.length && props.emptyDataMsg && (
                        <tr className={b('tr', {'no-data': true})}>
                            <td className={b('td')} colSpan={columns.length}>
                                {props.emptyDataMsg}
                            </td>
                        </tr>
                    )}
                </tbody>
                {shouldShowFooter && (
                    <tfoot className={b('footer')}>
                        {table.getFooterGroups().map((footerGroup) => (
                            <tr key={footerGroup.id}>
                                {footerGroup.headers.map((header) => (
                                    <th key={header.id} className={b('th')}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                  header.column.columnDef.footer,
                                                  header.getContext(),
                                              )}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </tfoot>
                )}
            </table>
            {isPaginationEnabled && (
                <Paginator
                    page={table.getState().pagination.pageIndex}
                    rowsCount={rows.length}
                    limit={table.getState().pagination.pageSize}
                    onChange={(page) => table.setPageIndex(page)}
                />
            )}
        </div>
    );
};
