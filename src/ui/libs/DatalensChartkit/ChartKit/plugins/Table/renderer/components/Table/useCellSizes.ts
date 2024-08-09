import React from 'react';

export const useCellSizes = (
    args: {
        tableContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
    },
    deps?: React.DependencyList,
) => {
    const {tableContainerRef} = args;
    const [cellSizes, setCellSizes] = React.useState<number[] | null>(null);

    React.useLayoutEffect(() => {
        if (!cellSizes) {
            const container = tableContainerRef?.current as Element;
            const table = container?.getElementsByTagName('table')?.[0];
            const tBody = table?.getElementsByTagName('tbody')?.[0];
            const tRow = tBody?.getElementsByTagName('tr')?.[0];
            const tCells = tRow?.getElementsByTagName('td') ?? [];

            const result = Array.from(tCells).map((tCell, index) => {
                return tCell.getBoundingClientRect()?.width + (index > 0 ? 1 : 0);
            });

            setCellSizes(result);
        }
    }, [cellSizes, tableContainerRef]);

    React.useEffect(() => {
        if (cellSizes) {
            setCellSizes(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return cellSizes;
};
