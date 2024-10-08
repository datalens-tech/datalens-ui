import React from 'react';

import block from 'bem-cn-lite';
import {ChartKitTableQa} from 'shared';

import type {BodyRowViewData, RowRef} from './types';

const b = block('dl-table');

type Props = {
    rows: BodyRowViewData[];
    style?: React.CSSProperties;
    onCellClick?: (event: React.MouseEvent, cell: unknown, rowId: string) => void;
    rowRef?: RowRef;
};

export const TableBody = React.memo<Props>((props: Props) => {
    const {rows, style, rowRef, onCellClick} = props;

    return (
        <tbody className={b('body')} style={style}>
            {rows.map((row) => {
                return (
                    <tr data-index={row.index} key={row.id} className={b('tr')} ref={rowRef}>
                        {row.cells.map((cell) => {
                            return (
                                <td
                                    key={cell.id}
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
                                        gridColumn: cell.colSpan
                                            ? `span ${cell.colSpan}`
                                            : undefined,
                                        maxHeight: cell.maxHeight,
                                    }}
                                    onClick={(event) => {
                                        if (onCellClick) {
                                            onCellClick(event, cell.data, row.id);
                                        }
                                    }}
                                    rowSpan={cell.rowSpan}
                                    colSpan={cell.colSpan}
                                >
                                    <div
                                        className={b('cell-content', {type: cell.contentType})}
                                        data-qa={ChartKitTableQa.CellContent}
                                        style={cell.contentStyle}
                                    >
                                        {cell.content}
                                    </div>
                                </td>
                            );
                        })}
                    </tr>
                );
            })}
        </tbody>
    );
});

TableBody.displayName = 'TableBody';
