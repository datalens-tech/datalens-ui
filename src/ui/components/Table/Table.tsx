import React from 'react';

import {
    ColumnDef,
    SortingState,
    createColumnHelper,
    flexRender,
    getCoreRowModel,
    getGroupedRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {SortIcon} from './components/SortIcon/SortIcon';
import type {OnTableClick, TData, TFoot, THead, TableProps} from './types';

import './Table.scss';

const b = block('dl-table');

function createColumn(args: {headCell: THead; footerCell?: TFoot; index: number}) {
    const {headCell, footerCell, index} = args;
    const {id, width, cell, ...columnOptions} = headCell;
    const options: ColumnDef<TData> = {
        ...columnOptions,
        id: `${id}__${index}`,
        meta: {
            width,
            footer: footerCell,
            head: headCell,
        },
    };

    if (cell) {
        options.cell = (context) => {
            return cell(context.row.getValue(context.column.id));
        };
    }

    if (footerCell) {
        if (cell) {
            options.footer = () => cell(footerCell);
        } else {
            options.footer = footerCell.formattedValue ?? (footerCell.value as string);
        }
    }

    return options;
}

function getTableColumns(args: {head?: THead[]; footer?: TFoot[]}) {
    const {head = [], footer = []} = args;
    const columnHelper = createColumnHelper<TData>();

    let lastColumnIndex = 0;
    const createHeadColumns = (cells: THead[]): ColumnDef<TData>[] => {
        return cells.map((headCell, index) => {
            const hasChildren = Boolean(headCell.columns?.length);
            const cellIndex = hasChildren ? -1 : lastColumnIndex;
            const footerCell = footer?.[cellIndex];
            const options: ColumnDef<TData> = createColumn({
                headCell,
                footerCell,
                index,
            });

            if (hasChildren) {
                return columnHelper.group({
                    ...options,
                    columns: createHeadColumns(headCell.columns || []),
                });
            } else {
                lastColumnIndex++;
            }

            return columnHelper.accessor((row) => {
                const cellData = row[cellIndex];
                if (headCell.cell) {
                    return cellData;
                }

                return cellData.formattedValue ?? cellData.value;
            }, options);
        });
    };

    return createHeadColumns(head);
}

function getTableData(args: {head?: THead[]; rows?: TData[]}) {
    const {head = [], rows = []} = args;
    const groupedCells = new Map();

    let cellIndex = 0;
    const setGrouping = (col: THead) => {
        if (col.columns?.length) {
            col.columns.forEach(setGrouping);
        } else {
            if (col.enableRowGrouping) {
                groupedCells.set(cellIndex, {rowIndex: -1});
            }
            cellIndex++;
        }
    };

    head.forEach(setGrouping);

    if (groupedCells.size) {
        return rows.map((row, rowIndex) => {
            return row.map((currentCell, index) => {
                if (groupedCells.has(index)) {
                    const prevCellData = groupedCells.get(index);
                    const prevCell = rows[prevCellData.rowIndex]?.[index];

                    if (prevCell && currentCell.value === prevCell?.value) {
                        prevCell.rowSpan = (prevCell.rowSpan || 1) + 1;
                        return {...currentCell, isVisible: false};
                    } else {
                        groupedCells.set(index, {rowIndex});
                    }
                }

                return currentCell;
            });
        });
    }

    return rows;
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
    const {head, footer, rows} = props.data;
    const columns = React.useMemo(() => getTableColumns({head, footer}), [head, footer]);
    const data = React.useMemo(() => getTableData({head, rows}), [head, rows]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getGroupedRowModel: getGroupedRowModel(),
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

    const tableRows = table.getRowModel().rows;
    const tableHeaders = table.getHeaderGroups();
    const shouldShowFooter = columns.some((column) => column.footer);

    return (
        <div className={b()}>
            {title && <div className={b('title')}>{title.text}</div>}
            <table className={b('table')}>
                <thead
                    className={b('header', {sticky: headerOptions?.sticky})}
                    data-qa={qa?.header}
                >
                    {tableHeaders.map((headerGroup) => {
                        if (!headerGroup.headers.length) {
                            return null;
                        }

                        return (
                            <tr key={headerGroup.id} className={b('tr')} data-qa={qa?.row}>
                                {headerGroup.headers.map((header) => {
                                    if (header.column.depth !== headerGroup.depth) {
                                        return null;
                                    }

                                    const width = header.column.columnDef.meta?.width;
                                    const isFixedSize = Boolean(width);
                                    const rowSpan = header.isPlaceholder
                                        ? tableHeaders.length - headerGroup.depth
                                        : undefined;
                                    const colSpan = header.colSpan > 1 ? header.colSpan : undefined;
                                    const align = colSpan ? 'center' : 'left';

                                    return (
                                        <th
                                            key={header.id}
                                            className={b('th', {
                                                clickable: header.column.getCanSort(),
                                                'fixed-size': isFixedSize,
                                                align,
                                            })}
                                            onClick={header.column.getToggleSortingHandler()}
                                            style={{width}}
                                            colSpan={colSpan}
                                            rowSpan={rowSpan}
                                        >
                                            <div className={b('th-content')}>
                                                {flexRender(
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
                    {tableRows.length
                        ? tableRows.map((row) => {
                              const visibleCells = row.getVisibleCells();
                              return (
                                  <tr key={row.id} className={b('tr')} data-qa={qa?.row}>
                                      {visibleCells.map((cell, index) => {
                                          const width = cell.column.columnDef.meta?.width;
                                          const isFixedSize = Boolean(width);
                                          const originalCellData = cell.row.original[index];
                                          const cellClassName = [
                                              b('td'),
                                              originalCellData?.className,
                                          ]
                                              .filter(Boolean)
                                              .join(' ');

                                          if (originalCellData?.isVisible === false) {
                                              return null;
                                          }

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
                                                  rowSpan={originalCellData?.rowSpan}
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
                              );
                          })
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
