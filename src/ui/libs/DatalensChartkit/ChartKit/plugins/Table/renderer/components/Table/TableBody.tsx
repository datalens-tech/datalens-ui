import React from 'react';

import block from 'bem-cn-lite';
import {ChartKitTableQa} from 'shared';

import type {BodyCellViewData, BodyRowViewData, RowRef} from './types';

const b = block('dl-table');

type Props = {
    rows: BodyRowViewData[];
    style?: React.CSSProperties;
    onCellClick?: (event: React.MouseEvent, cell: unknown, rowId: string) => void;
    rowRef?: RowRef;
};

const TableBodyCell = (props: {
    cell: BodyCellViewData;
    onClick?: (event: React.MouseEvent) => void;
    isLastPinnedCell?: boolean;
}) => {
    const {cell, isLastPinnedCell, onClick} = props;

    return (
        <td
            className={b(
                'td',
                {
                    type: cell.type,
                    pinned: cell.pinned,
                },
                cell.className,
            )}
            style={{
                ...cell.style,
                gridRow: cell.rowSpan ? `span ${cell.rowSpan}` : undefined,
                gridColumn: cell.colSpan ? `span ${cell.colSpan}` : undefined,
                maxHeight: cell.maxHeight,
            }}
            onClick={onClick}
            rowSpan={cell.rowSpan}
            colSpan={cell.colSpan}
        >
            {isLastPinnedCell && <div className={b('shadow')} />}
            <div
                className={b('cell-content', {type: cell.contentType})}
                data-qa={ChartKitTableQa.CellContent}
                style={cell.contentStyle}
            >
                {cell.content}
            </div>
        </td>
    );
};

export const TableBody = React.memo<Props>((props: Props) => {
    const {rows, style, rowRef, onCellClick} = props;

    return (
        <tbody className={b('body')} style={style}>
            {rows.map((row) => {
                return (
                    <tr data-index={row.index} key={row.id} className={b('tr')} ref={rowRef}>
                        {row.cells.map((cell, index) => {
                            const nextCellData = row.cells[index + 1];
                            const isLastPinnedCell = cell.pinned && !nextCellData?.pinned;

                            return (
                                <TableBodyCell
                                    key={cell.id}
                                    cell={cell}
                                    onClick={(event) => {
                                        if (onCellClick) {
                                            onCellClick(event, cell.data, row.id);
                                        }
                                    }}
                                    isLastPinnedCell={isLastPinnedCell}
                                />
                            );
                        })}
                    </tr>
                );
            })}
        </tbody>
    );
});

TableBody.displayName = 'TableBody';
