import React from 'react';

import type {HeaderGroup} from '@tanstack/react-table';
import {flexRender} from '@tanstack/react-table';
import block from 'bem-cn-lite';

import type {TData, TableDimensions} from '../../types';
import {SortIcon} from '../SortIcon/SortIcon';

const b = block('dl-table');

type Props = {
    headers: HeaderGroup<TData>[];
    sticky?: boolean;
    tableDimensions?: TableDimensions;
};

export const TableHead = (props: Props) => {
    const {headers, sticky, tableDimensions} = props;

    return (
        <thead className={b('header', {sticky})}>
            {headers.map((headerGroup, rowIndex) => {
                if (!headerGroup.headers.length) {
                    return null;
                }

                return (
                    <tr key={headerGroup.id} className={b('tr')}>
                        {headerGroup.headers.map((header, index, rowCells) => {
                            if (header.column.depth !== headerGroup.depth) {
                                return null;
                            }

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
                            const nextCellData = rowCells[index + 1]?.column.columnDef.meta?.head;
                            const isLastPinnedCell = pinned && !nextCellData?.pinned;
                            const cellDimensions = tableDimensions?.head[rowIndex]?.[index];
                            const cellStyle: React.CSSProperties = {
                                width,
                                left: pinned ? cellDimensions?.left : undefined,
                            };

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
                                    {isLastPinnedCell && (
                                        <div
                                            className={b('shadow')}
                                            style={{
                                                height: (tableDimensions?.height || 0) - 1,
                                            }}
                                        />
                                    )}
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
