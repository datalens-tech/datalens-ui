import React from 'react';

import {waitForContent} from '../../../../../helpers/wait-for-content';

function getTableSizes(rows: HTMLTableRowElement[], tableScale = 1) {
    const colsCount = Array.from(rows[0]?.childNodes ?? []).reduce((sum, c) => {
        const colSpan = Number((c as Element).getAttribute('colSpan') || 1);
        return sum + colSpan;
    }, 0);
    const result = new Array(rows.length).fill(null).map(() => new Array(colsCount).fill(null));

    result.forEach((_r, rowIndex) => {
        const row = rows[rowIndex];
        let cellIndex = 0;
        Array.from(row.childNodes ?? []).forEach((c) => {
            const cell = c as Element;
            let rowSpan = Number(cell.getAttribute('rowSpan') || 1);
            let colSpan = Number(cell.getAttribute('colSpan') || 1);
            const cellWidth = cell.getBoundingClientRect()?.width / tableScale;

            if (result[rowIndex][cellIndex] !== null) {
                cellIndex = result[rowIndex].findIndex((val, i) => i > cellIndex && val === null);
            }

            while (rowSpan - 1 > 0) {
                rowSpan -= 1;
                result[rowIndex + rowSpan][cellIndex] = cellWidth;
            }

            if (colSpan > 1) {
                while (colSpan > 1) {
                    colSpan -= 1;
                    cellIndex += 1;
                }
            } else {
                result[rowIndex][cellIndex] = cellWidth;
            }

            cellIndex += 1;
        });
    });

    return result.reduce<number[]>((acc, row) => {
        row.forEach((cellWidth, index) => {
            if (cellWidth !== null) {
                acc[index] = acc[index] || cellWidth;
            }
        });
        return acc;
    }, []);
}

export const useCellSizes = (
    args: {
        tableContainerRef?: React.MutableRefObject<HTMLDivElement | null>;
    },
    deps?: React.DependencyList,
) => {
    const {tableContainerRef} = args;
    const [cellSizes, setCellSizes] = React.useState<number[] | null>(null);

    React.useLayoutEffect(() => {
        const container = tableContainerRef?.current as Element;
        const table = container?.getElementsByTagName('table')?.[0];

        if (!cellSizes) {
            waitForContent(container).finally(() => {
                let sizes: number[] = [];
                const tHeadRows = Array.from(
                    table?.getElementsByTagName('thead')?.[0]?.childNodes ?? [],
                );

                const tableScale = table?.getBoundingClientRect()?.width / table?.clientWidth;

                if (tHeadRows.length) {
                    sizes = getTableSizes(tHeadRows as HTMLTableRowElement[], tableScale);
                } else {
                    const tBodyRows = Array.from(
                        table?.getElementsByTagName('tbody')?.[0]?.childNodes ?? [],
                    );
                    if (tBodyRows.length) {
                        sizes = getTableSizes([tBodyRows[0] as HTMLTableRowElement], tableScale);
                    }
                }

                setCellSizes(sizes);
            });
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
