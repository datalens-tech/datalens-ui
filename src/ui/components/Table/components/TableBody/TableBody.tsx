import React from 'react';

import {ColumnDef, Row, flexRender} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {OnCellClickFn, TData, TableDimensions, TableProps} from '../../types';

const b = block('dl-table');

type Props = {
    columns: ColumnDef<TData, unknown>[];
    rows: Row<TData>[];
    noData?: TableProps['noData'];
    onCellClick?: OnCellClickFn;
    tableDimensions?: TableDimensions;
};

export const TableBody = (props: Props) => {
    const {rows, columns, tableDimensions, noData, onCellClick} = props;

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

                            const left = pinned
                                ? tableDimensions?.head[0]?.[index]?.left
                                : undefined;
                            const cellStyle = {
                                left,
                                ...originalCellData?.css,
                            };

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
