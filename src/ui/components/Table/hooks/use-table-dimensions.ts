import React from 'react';

import debounce from 'lodash/debounce';

import {TableProps} from '../types';

type TableDimensions = {
    columnsWidth?: number[];
    height?: number;
};

type UseTableDimensionsArgs = {
    table: React.RefObject<HTMLTableElement>;
    data: TableProps['data'];
};

export const useTableDimensions = (args: UseTableDimensionsArgs) => {
    const {
        table: tableRef,
        data: {head, footer, rows},
    } = args;
    const [tableDimensions, setTableDimensions] = React.useState<TableDimensions>({});

    const setDimensions = React.useCallback(
        debounce(() => {
            const table = tableRef.current;
            if (!table) {
                return;
            }

            const tableCells = Array.from(table.rows[0]?.cells || []);

            const updates = {
                height: table.getBoundingClientRect().height,
                columnsWidth: tableCells.map((el) => {
                    return el.getBoundingClientRect().width;
                }),
            };

            setTableDimensions(updates);
        }, 0),
        [tableRef],
    );

    const resizeObserver = React.useRef<ResizeObserver | null>(null);
    React.useEffect(() => {
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
    }, [tableRef, setDimensions]);

    React.useEffect(() => {
        setDimensions();
    }, [head, rows, footer, setDimensions]);

    return {tableDimensions};
};
