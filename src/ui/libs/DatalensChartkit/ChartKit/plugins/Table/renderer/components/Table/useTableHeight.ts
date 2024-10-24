import React from 'react';

export const useTableHeight = (args: {
    ref: React.MutableRefObject<HTMLTableElement | null>;
    ready: boolean;
    totalSize?: number;
}) => {
    const {ref, ready, totalSize} = args;
    const [height, setHeight] = React.useState<number | undefined>();

    React.useEffect(() => {
        const table = ref?.current as Element;
        const tHead = table?.getElementsByTagName('thead')?.[0];
        const tBody = table?.getElementsByTagName('tbody')?.[0];
        const tFoot = table?.getElementsByTagName('tfoot')?.[0];

        const tableActualHeight =
            (tHead?.clientHeight ?? 0) + tBody?.clientHeight + (tFoot?.clientHeight ?? 0);
        if (tableActualHeight && tableActualHeight !== height) {
            setHeight(tableActualHeight);
        }
    }, [height, ref, ready, totalSize]);

    return height;
};
