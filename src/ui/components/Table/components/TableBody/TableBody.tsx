import React from 'react';

import type {ColumnDef, Row} from '@tanstack/react-table';
import type {Virtualizer} from '@tanstack/react-virtual';
import block from 'bem-cn-lite';

import type {OnCellClickFn, TData, TableDimensions, TableProps} from '../../types';
import {getColumnWidth} from '../../utils';

const b = block('dl-table');

type Props = {
    columns: ColumnDef<TData, unknown>[];
    rows: Row<TData>[];
    noData?: TableProps['noData'];
    onCellClick?: OnCellClickFn;
    tableDimensions?: TableDimensions;
    rowVirtualizer: Virtualizer<Element, Element>;
};

export const TableBody = (props: Props) => {
    const {rows, columns, tableDimensions, noData, onCellClick, rowVirtualizer} = props;

    if (!rows.length) {
        return (
            <tbody className={b('body')}>
                {noData?.text && (
                    <tr className={b('tr', {'no-data': true})}>
                        <td className={b('td')} colSpan={columns.length}>
                            {noData.text}
                        </td>
                    </tr>
                )}
            </tbody>
        );
    }

    const handleCellClick: OnCellClickFn = (args) => {
        if (onCellClick) {
            onCellClick(args);
        }
    };

    const columnOptions: Record<number, {width?: string | number}> = {};
    rows[0]?.getVisibleCells().forEach((cell, index) => {
        const width = getColumnWidth(cell.column);
        columnOptions[index] = {width};
    });

    const virtualItems = rowVirtualizer.getVirtualItems();

    return (
        <tbody className={b('body')} style={{height: `${rowVirtualizer.getTotalSize()}px`}}>
            {virtualItems.map((virtualRow) => {
                const row = rows[virtualRow.index] as Row<TData>;
                const visibleCells = row.getVisibleCells();

                return (
                    <tr
                        key={row.id}
                        className={b('tr')}
                        data-index={virtualRow.index}
                        ref={(node) => rowVirtualizer.measureElement(node)}
                        style={{
                            transform: `translateY(${virtualRow.start}px)`,
                        }}
                    >
                        {visibleCells.map((cell, index) => {
                            const originalHeadData = cell.column.columnDef.meta?.head;
                            const width = columnOptions[index]?.width;

                            const isFixedSize = Boolean(width);
                            const originalCellData = cell.row.original[index];
                            const pinned = Boolean(originalHeadData?.pinned);
                            const cellClassName = [
                                b('td', {pinned, 'fixed-size': isFixedSize}),
                                originalCellData?.className,
                            ]
                                .filter(Boolean)
                                .join(' ');

                            if (originalCellData?.isVisible === false) {
                                return null;
                            }

                            const left = pinned
                                ? tableDimensions?.head[0]?.[index]?.left
                                : undefined;
                            const cellStyle = {
                                width: cell.column.getSize(),
                                left,
                                ...originalCellData?.css,
                            };

                            const renderCell =
                                typeof cell.column.columnDef.cell === 'function'
                                    ? cell.column.columnDef.cell
                                    : () => cell.column.columnDef.cell;

                            return (
                                <td
                                    key={cell.id}
                                    className={cellClassName}
                                    style={cellStyle}
                                    onClick={(event) =>
                                        handleCellClick({
                                            row: row.original,
                                            cell: originalCellData,
                                            event,
                                        })
                                    }
                                    rowSpan={originalCellData?.rowSpan}
                                >
                                    <div className={b('td-content')} style={{width}}>
                                        {renderCell(cell.getContext())}
                                    </div>
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </tbody>
    );
};
