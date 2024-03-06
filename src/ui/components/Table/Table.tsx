import React from 'react';

import {
    ColumnDef,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {Paginator} from './components/Paginator/Paginator';
import {SortIcon} from './components/SortIcon/SortIcon';
import type {TData, TableProps} from './types';

import './Table.scss';

const b = block('dl-table');

function getTableData(args: TableProps['data']) {
    const {head = [], footer = [], rows = []} = args;
    const columnHelper = createColumnHelper<TData>();
    const columns: ColumnDef<TData>[] = head.map((headCell, index) => {
        const {width, renderCell, ...columnOptions} = headCell;
        const footerCell = footer?.[index];
        const options: ColumnDef<TData> = {
            ...columnOptions,
            meta: {
                width,
            },
        };

        if (renderCell) {
            options.cell = (context) => renderCell(context.row.original[index]);
        }

        if (footerCell) {
            if (renderCell) {
                options.footer = () => renderCell(footerCell);
            } else {
                options.footer = footerCell.formattedValue ?? (footerCell.value as string);
            }
        }

        return columnHelper.accessor((row) => {
            const cellData = row[index];
            return cellData.formattedValue ?? cellData.value;
        }, options);
    });

    return {columns, data: rows};
}

export const Table = (props: TableProps) => {
    const {title, pagination, onPaginationChange, noData} = props;
    const isPaginationEnabled = Boolean(pagination?.enabled && pagination.pageSize);
    const paginationState = {
        pageIndex: 0,
        pageSize: Infinity,
        ...pagination,
    };

    const {columns, data} = React.useMemo(() => getTableData(props.data), [props.data]);
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
                  onPaginationChange: (updater) => {
                      if (onPaginationChange) {
                          const newPaginationState =
                              typeof updater === 'function' ? updater(paginationState) : updater;
                          onPaginationChange(newPaginationState.pageIndex);
                      }
                  },
              }
            : {}),
    });

    const rows = table.getRowModel().rows;
    const shouldShowFooter = columns.some((column) => column.footer);

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
                    {rows.length
                        ? rows.map((row) => (
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
                          ))
                        : noData?.text && (
                              <tr className={b('tr', {'no-data': true})}>
                                  <td className={b('td')} colSpan={columns.length}>
                                      {noData.text}
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
                    onChange={table.setPageIndex}
                />
            )}
        </div>
    );
};
