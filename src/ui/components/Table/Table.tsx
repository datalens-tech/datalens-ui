import React from 'react';

import {
    ColumnDef,
    OnChangeFn,
    PaginationState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {Paginator} from './components/Paginator/Paginator';
import {SortIcon} from './components/SortIcon/SortIcon';

import './Table.scss';

const b = block('dl-table');

type TableProps = {
    title?: {text: string};
    data: {
        head?: any[];
        rows?: any[];
        footer?: any[];
    };
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
    fieldId?: string;
}[];

function getTableData(args: TableProps['data']) {
    const {head = [], footer = [], rows = []} = args;
    const footerData = footer[0]?.cells;
    const columnHelper = createColumnHelper<TData>();
    const columns: ColumnDef<TData>[] = head.map((headCell: any, index: number) => {
        return columnHelper.accessor((row) => row[index].value, {
            id: headCell.id,
            header: headCell.name,
            enableSorting: true,
            footer: footerData?.[index]?.value,
        });
    });

    const data: TData[] = rows?.map((row: any) => row.cells) || [];

    return {columns, data};
}

export const Table = React.forwardRef<unknown, TableProps>((props) => {
    const {title} = props;
    const {columns, data} = getTableData(props.data);
    const shouldShowFooter = columns.some((column) => column.footer);
    const paginationState: PaginationState = {
        pageIndex: props.pagination.pageIndex,
        pageSize: props.pagination.pageSize,
    };
    console.log('Table', {props, data, columns, paginationState});

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
                                {headerGroup.headers.map((header) => (
                                    <th
                                        key={header.id}
                                        className={b('th', {
                                            sortable: header.column.getCanSort(),
                                        })}
                                        onClick={header.column.getToggleSortingHandler()}
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
                                ))}
                            </tr>
                        );
                    })}
                </thead>
                <tbody className={b('body')}>
                    {rows.map((row) => (
                        <tr key={row.id} className={b('tr')}>
                            {row.getVisibleCells().map((cell) => (
                                <td key={cell.id} className={b('td')}>
                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                </td>
                            ))}
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
});

Table.displayName = 'Table';
