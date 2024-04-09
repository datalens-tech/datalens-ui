import React from 'react';

import {ColumnDef, Row, flexRender} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {OnCellClickFn, TData, TableProps} from '../../types';

const b = block('dl-table');

type Props = {
    columns: ColumnDef<TData, unknown>[];
    columnsWidth?: number[];
    rows: Row<TData>[];
    noData: TableProps['noData'];
    onCellClick?: OnCellClickFn;
};

export const TableBody = (props: Props) => {
    const {rows, columns, columnsWidth, noData, onCellClick} = props;

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

    return (
        <tbody className={b('body')}>
            {rows.map((row) => {
                const visibleCells = row.getVisibleCells();
                let left = 0;

                return (
                    <tr key={row.id} className={b('tr')}>
                        {visibleCells.map((cell, index) => {
                            const originalHeadData = cell.column.columnDef.meta?.head;
                            const width = cell.column.columnDef.meta?.width;
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

                            const cellStyle: React.CSSProperties = {
                                width,
                                left: pinned ? left : undefined,
                                ...originalCellData?.css,
                            };
                            left += columnsWidth?.[index] || 0;

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
                                    {pinned && <div className={b('curtain')} />}
                                    <div className={b('td-content')}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
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
