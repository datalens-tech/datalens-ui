import React from 'react';

import {ColumnDef, Row, flexRender} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {OnCellClickFn, TData, TableProps} from '../../types';

const b = block('dl-table');

type Props = {
    columns: ColumnDef<TData, unknown>[];
    rows: Row<TData>[];
    noData: TableProps['noData'];
    onCellClick?: OnCellClickFn;
};

export const TableBody = (props: Props) => {
    const {rows, columns, noData, onCellClick} = props;

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
                return (
                    <tr key={row.id} className={b('tr')}>
                        {visibleCells.map((cell, index) => {
                            const width = cell.column.columnDef.meta?.width;
                            const isFixedSize = Boolean(width);
                            const originalCellData = cell.row.original[index];
                            const cellClassName = [b('td'), originalCellData?.className]
                                .filter(Boolean)
                                .join(' ');

                            if (originalCellData?.isVisible === false) {
                                return null;
                            }

                            return (
                                <td
                                    key={cell.id}
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
