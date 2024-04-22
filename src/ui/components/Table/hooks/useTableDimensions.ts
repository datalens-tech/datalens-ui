import React from 'react';

import isEqual from 'lodash/isEqual';

import type {TableDimensions, TableProps} from '../types';

type UseTableDimensionsArgs = {
    table: React.RefObject<HTMLTableElement>;
    data: TableProps['data'];
};

export const useTableDimensions = (args: UseTableDimensionsArgs) => {
    const {table: tableRef, data} = args;
    const hasPinnedColumns = data.head?.some((d) => d.pinned);
    const [tableDimensions, setTableDimensions] = React.useState<TableDimensions | undefined>();

    const setDimensions = React.useCallback(() => {
        const table = tableRef.current;
        if (!table || !hasPinnedColumns) {
            return;
        }

        const {left: tableLeft, top: tableTop} = table.getBoundingClientRect();
        const offsetParent = table.offsetParent;
        const scrollLeft = offsetParent?.scrollLeft || 0;
        let left: number;
        const tableHead = Array.from(table.tHead?.rows || []).map((r) => {
            return Array.from(r.cells).map((cell, _index) => {
                const {width, top, left: originalLeft} = cell.getBoundingClientRect();
                left = left ?? originalLeft - (tableLeft + scrollLeft);
                const result = {
                    width,
                    left,
                    top: top - tableTop,
                };
                left += width;
                return result;
            });
        });

        const updates: TableDimensions = {
            height: offsetParent?.clientHeight || table.clientHeight,
            head: tableHead,
            minWidth: offsetParent?.clientWidth,
        };

        if (!isEqual(tableDimensions, updates)) {
            setTableDimensions(updates);
        }
    }, [hasPinnedColumns, tableDimensions, tableRef]);

    React.useLayoutEffect(() => {
        setDimensions();
    }, [data, setDimensions]);

    const resizeObserver = React.useRef<ResizeObserver | null>(null);
    React.useLayoutEffect(() => {
        if (tableRef.current) {
            resizeObserver.current = new ResizeObserver(() => {
                setDimensions();
            });
            resizeObserver.current.observe(tableRef.current);
        }

        return () => {
            resizeObserver.current?.disconnect();
            resizeObserver.current = null;
        };
    }, [setDimensions, tableRef]);

    return {tableDimensions};
};
