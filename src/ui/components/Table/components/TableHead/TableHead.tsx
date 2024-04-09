import React from 'react';

import type {HeaderGroup} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import {TData} from '../../types';
import {SortIcon} from '../SortIcon/SortIcon';

const b = block('dl-table');

type Props = {
    headers: HeaderGroup<TData>[];
    sticky?: boolean;
    columnsWidth?: number[];
    tableHeight?: number;
};

export const TableHead = (props: Props) => {
    const {headers, sticky, columnsWidth, tableHeight} = props;
    const pinnedColumnSumWidth = headers[0]?.headers.reduce((sum, h, index) => {
        if (h.column.columnDef.meta?.head?.pinned) {
            return sum + (columnsWidth?.[index] || 0);
        }
        return sum;
    }, 0);

    return (
        <thead className={b('header', {sticky})}>
            {headers.map((headerGroup, index) => {
                if (!headerGroup.headers.length) {
                    return null;
                }

                const isFirstRow = index === 0;
                let left = 0;

                return (
                    <tr key={headerGroup.id} className={b('tr')}>
                        {headerGroup.headers.map((header, index) => {
                            if (header.column.depth !== headerGroup.depth) {
                                return null;
                            }

                            const isFirstCell = index === 0;
                            const shouldShowShadow =
                                pinnedColumnSumWidth > 0 && isFirstRow && isFirstCell;
                            const original = header.column.columnDef.meta?.head;
                            const width = header.column.columnDef.meta?.width;
                            const isFixedSize = Boolean(width);
                            const rowSpan = header.isPlaceholder
                                ? headers.length - headerGroup.depth
                                : undefined;
                            const colSpan = header.colSpan > 1 ? header.colSpan : undefined;
                            const align = colSpan ? 'center' : 'left';
                            const sortable = header.column.getCanSort();
                            const pinned = Boolean(original?.pinned);
                            const cellStyle: React.CSSProperties = {
                                width,
                                left: pinned ? left : undefined,
                            };
                            left += columnsWidth?.[index] || 0;

                            return (
                                <th
                                    key={header.id}
                                    className={b('th', {
                                        clickable: sortable,
                                        'fixed-size': isFixedSize,
                                        align,
                                        pinned,
                                    })}
                                    onClick={header.column.getToggleSortingHandler()}
                                    style={cellStyle}
                                    colSpan={colSpan}
                                    rowSpan={rowSpan}
                                >
                                    {shouldShowShadow && (
                                        <div
                                            className={b('shadow')}
                                            style={{
                                                height: (tableHeight || 0) - 1,
                                                width: pinnedColumnSumWidth,
                                            }}
                                        />
                                    )}
                                    {pinned && <div className={b('curtain')} />}
                                    <div className={b('th-content', {sortable})}>
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
    );
};
