import React from 'react';

import isEqual from 'lodash/isEqual';

type UseTableDimensionsArgs = {
    table: React.RefObject<HTMLTableElement>;
};

type TableWidth = {
    tableWidth: number;
    columns?: {width: number}[];
};

export const useColumnsWidth = (args: UseTableDimensionsArgs) => {
    const {table: tableRef} = args;
    const [value, setValues] = React.useState<TableWidth | undefined>();

    const setDimensions = React.useCallback(() => {
        const table = tableRef.current;
        if (!table) {
            return;
        }

        let tableWidth = 0;
        let columns;
        const firstRow = table.tBodies[0]?.rows[0];
        if (firstRow) {
            columns = Array.from(firstRow.cells).map((cell) => {
                const cellWidth = cell.getBoundingClientRect().width;
                tableWidth += cellWidth;

                return {width: cellWidth};
            });
        }

        const updates: TableWidth = {
            tableWidth,
            columns,
        };

        if (!isEqual(value, updates)) {
            setValues(updates);
        }
    }, []);

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
    }, []);

    return value;
};
