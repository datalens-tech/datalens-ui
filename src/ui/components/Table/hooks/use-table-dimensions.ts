import React from 'react';

import isEqual from 'lodash/isEqual';

import type {TableDimensions, TableProps} from '../types';

type UseTableDimensionsArgs = {
    table: React.RefObject<HTMLTableElement>;
    data: TableProps['data'];
};

export const useTableDimensions = (args: UseTableDimensionsArgs) => {
    const {table: tableRef, data} = args;
    const [tableDimensions, setTableDimensions] = React.useState<TableDimensions | undefined>();
    const prevData = React.useRef<TableProps['data']>();
    const isDataChanged = Boolean(prevData.current && !isEqual(prevData.current, data));

    const setDimensions = React.useCallback(() => {
        const table = tableRef.current;
        if (!table) {
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
        };

        prevData.current = data;

        if (!isEqual(tableDimensions, updates)) {
            setTableDimensions(updates);
        }
    }, [data]);

    React.useLayoutEffect(() => {
        setDimensions();
    }, [data]);

    return isDataChanged ? {} : {tableDimensions};
};
