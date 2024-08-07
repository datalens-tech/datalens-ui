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
        <thead className={b('header', {sticky})}>
            {rows.map((headerGroup) => {
                return (
                    <tr key={headerGroup.id} className={b('tr')} style={style}>
                        {headerGroup.cells.map((th, index) => {
                            const nextCellData = headerGroup.cells[index + 1];
                            const isLastPinnedCell = th.pinned && !nextCellData?.pinned;
                            return (
                                <th
                                    key={th.id}
                                    className={b('th', {
                                        clickable: th.sortable,
                                        pinned: th.pinned,
                                        'first-cell': index === 0,
                                    })}
                                    style={{
                                        ...th.style,
                                        gridRow: `span ${th.rowSpan}`,
                                        gridColumn: `span ${th.colSpan}`,
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
