import React from 'react';

import {
    ColumnDef,
    SortingState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {SortIcon} from './components/SortIcon/SortIcon';
import type {OnTableClick, TData, TableProps} from './types';

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
                footer: footerCell,
                head: headCell,
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
    const {
        title,
        noData,
        onClick,
        header: headerOptions,
        qa,
        manualSorting,
        onSortingChange,
    } = props;
    const {columns, data} = React.useMemo(() => getTableData(props.data), [props.data]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        sortDescFirst: false,
        manualSorting,
        state: {
            sorting,
        },
        onSortingChange: (updater) => {
            setSorting(updater);

            if (onSortingChange) {
                const updates = typeof updater === 'function' ? updater(sorting) : updater;
                const id = updates[0]?.id;
                const desc = updates[0]?.desc;
                const headCellData = columns.find((c) => c.id === id)?.meta?.head;
                onSortingChange({cell: headCellData, sortOrder: desc ? 'desc' : 'asc'});
            }
        },
    });

    const handleCellClick: OnTableClick = (args) => {
        if (onClick) {
            onClick(args);
        }
    };

    const rows = table.getRowModel().rows;
    const shouldShowFooter = columns.some((column) => column.footer);

    return (
        <div className={b()}>
            {title && <div className={b('title')}>{title.text}</div>}
            <table className={b('table')}>
                <thead
                    className={b('header', {sticky: headerOptions?.sticky})}
                    data-qa={qa?.header}
                >
                    {table.getHeaderGroups().map((headerGroup) => {
                        if (!headerGroup.headers.length) {
                            return null;
                        }

                        return (
                            <tr key={headerGroup.id} className={b('tr')} data-qa={qa?.row}>
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
                                                <SortIcon
                                                    className={b('sort-icon')}
                                                    sorting={header.column.getIsSorted()}
                                                />
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        );
                    })}
                </thead>
                <tbody className={b('body')} data-qa={qa?.body}>
                    {rows.length
                        ? rows.map((row) => (
                              <tr key={row.id} className={b('tr')} data-qa={qa?.row}>
                                  {row.getVisibleCells().map((cell, index) => {
                                      const width = cell.column.columnDef.meta?.width;
                                      const isFixedSize = Boolean(width);
                                      const originalCellData = cell.row.original[index];
                                      const cellClassName = [b('td'), originalCellData?.className]
                                          .filter(Boolean)
                                          .join(' ');

                                      return (
                                          <td
                                              key={cell.id}
                                              data-qa={qa?.cell}
                                              className={cellClassName}
                                              style={originalCellData?.css}
                                              onClick={(event) =>
                                                  handleCellClick({
                                                      row: row.original,
                                                      cell: originalCellData,
                                                      event,
                                                  })
                                              }
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
                    <tfoot className={b('footer')} data-qa={qa?.footer}>
                        {table.getFooterGroups().map((footerGroup) => (
                            <tr key={footerGroup.id} className={b('tr')} data-qa={qa?.row}>
                                {footerGroup.headers.map((header) => {
                                    const columnDef = header.column.columnDef;
                                    const style = columnDef?.meta?.footer?.css;

                                    return (
                                        <td key={header.id} className={b('td')} style={style}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(columnDef.footer, header.getContext())}
                                        </td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tfoot>
                )}
            </table>
        </div>
    );
};
