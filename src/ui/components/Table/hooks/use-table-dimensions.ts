import React from 'react';

import debounce from 'lodash/debounce';

import type {TableDimensions, TableProps} from '../types';

type UseTableDimensionsArgs = {
    table: React.RefObject<HTMLTableElement>;
    data: TableProps['data'];
};

export const useTableDimensions = (args: UseTableDimensionsArgs) => {
    const {
        table: tableRef,
        data: {head, footer, rows},
    } = args;
    const [tableDimensions, setTableDimensions] = React.useState<TableDimensions | undefined>();

    const setDimensions = React.useCallback(
        debounce(() => {
            const table = tableRef.current;
            if (!table) {
                return;
            }

            // const tableCells = Array.from(table.tHead?.rows[0]?.cells || []);
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
