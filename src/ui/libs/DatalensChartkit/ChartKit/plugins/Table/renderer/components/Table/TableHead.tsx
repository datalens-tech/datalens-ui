import React from 'react';

import block from 'bem-cn-lite';

import {SortIcon} from '../SortIcon/SortIcon';

import type {HeadRowViewData} from './types';

const b = block('dl-table');

type Props = {
    sticky: boolean;
    rows: HeadRowViewData[];
    style?: React.CSSProperties;
    tableHeight?: number;
};

export const TableHead = React.memo<Props>((props: Props) => {
    const {sticky, rows, style, tableHeight} = props;

    return (
        <thead className={b('header', {sticky})} style={style}>
            {rows.map((row) => {
                return (
                    <tr key={row.id} className={b('tr')}>
                        {row.cells.map((th, index) => {
                            const nextCellData = row.cells[index + 1];
                            const isLastPinnedCell = th.pinned && !nextCellData?.pinned;
                            return (
                                <th
                                    key={th.id}
                                    className={b('th', {
                                        clickable: th.sortable,
                                        pinned: th.pinned,
                                        align: th.colSpan && th.colSpan > 1 ? 'center' : undefined,
                                    })}
                                    style={{
                                        ...th.style,
                                        gridRow: th.rowSpan ? `span ${th.rowSpan}` : undefined,
                                        gridColumn: th.colSpan ? `span ${th.colSpan}` : undefined,
                                    }}
                                    colSpan={th.colSpan}
                                    rowSpan={th.rowSpan}
                                    onClick={th.onClick}
                                >
                                    {isLastPinnedCell && (
                                        <div
                                            className={b('shadow')}
                                            style={{
                                                height: (tableHeight || 0) - 1,
                                            }}
                                        />
                                    )}
                                    <div
                                        className={b('th-content', {
                                            sortable: th.sortable,
                                        })}
                                    >
                                        {th.content}
                                        <SortIcon className={b('sort-icon')} sorting={th.sorting} />
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                );
            })}
        </thead>
    );
});

TableHead.displayName = 'TableHead';
