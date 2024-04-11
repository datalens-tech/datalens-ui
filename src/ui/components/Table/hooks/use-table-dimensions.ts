import React from 'react';

import debounce from 'lodash/debounce';
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

    const setDimensions = React.useCallback(
        debounce(() => {
            const table = tableRef.current;
            if (!table) {
                return;
            }

            const {height, left: tableLeft, top: tableTop} = table.getBoundingClientRect();
            const tableHead = Array.from(table.tHead?.rows || []).map((r) => {
                return Array.from(r.cells).map((cell) => {
                    const {width, top, left} = cell.getBoundingClientRect();
                    return {width, left: left - tableLeft, top: top - tableTop};
                });
            });

            const updates: TableDimensions = {
                height,
                head: tableHead,
            };

            prevData.current = data;

            if (!isEqual(tableDimensions, updates)) {
                setTableDimensions(updates);
            }
        }, 0),
        [data],
    );

    React.useEffect(() => {
        setDimensions();
    }, [data]);

    return isDataChanged ? {} : {tableDimensions};
};
