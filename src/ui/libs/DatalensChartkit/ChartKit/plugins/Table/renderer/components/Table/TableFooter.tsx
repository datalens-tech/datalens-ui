import React from 'react';

import block from 'bem-cn-lite';

import type {FooterRowViewData} from './types';

const b = block('dl-table');

type Props = {
    rows: FooterRowViewData[];
    style?: React.CSSProperties;
};

export const TableFooter = React.memo<Props>((props: Props) => {
    const {rows, style} = props;

    if (!rows.length) {
        return null;
    }

    return (
        <tfoot className={b('footer')} style={style}>
            {rows.map((row) => (
                <tr key={row.id} className={b('tr')}>
                    {row.cells.map((cell, index) => {
                        const nextCellData = row.cells[index + 1];
                        const isLastPinnedCell = cell.pinned && !nextCellData?.pinned;

                        return (
                            <td
                                key={cell.id}
                                className={b('td', {
                                    pinned: cell.pinned,
                                    type: cell.type,
                                })}
                                style={{
                                    ...cell.style,
                                }}
                            >
                                {isLastPinnedCell && <div className={b('shadow')} />}
                                <div style={cell.contentStyle} className={b('footer-cell-content')}>
                                    {cell.content}
                                </div>
                            </td>
                        );
                    })}
                </tr>
            ))}
        </tfoot>
    );
});

TableFooter.displayName = 'TableFooter';
