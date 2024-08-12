import React from 'react';

import findLast from 'lodash/findLast';

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
            const tRows = Array.from(table?.getElementsByTagName('tr') ?? []);
            const tRow = findLast(tRows, (r) =>
                Array.from(r.childNodes).every(
                    (td) => Number((td as Element).getAttribute('colSpan') || 1) <= 1,
                ),
            );

            const result = Array.from(tRow?.childNodes ?? []).map((tCell, index) => {
                return (tCell as Element).getBoundingClientRect()?.width + (index === 0 ? 1 : 0);
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
