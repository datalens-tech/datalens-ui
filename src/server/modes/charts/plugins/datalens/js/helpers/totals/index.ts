import type {GetMergedTotalsArgs} from './types';

export const getMergedTotals = (args: GetMergedTotalsArgs): (string | null)[] => {
    const {mergedOrder, isFirstDataset, lastResultRow, totals, currentOrder, resultDataRows} = args;

    const mergedTotals = [...totals];

    if (isFirstDataset) {
        return [...mergedTotals, ...(lastResultRow.data || [])];
    }

    if (resultDataRows.length) {
        currentOrder.forEach(({title}, index) => {
            const indexInMergedOrder = mergedOrder.findIndex((orderItem) => {
                if (Array.isArray(orderItem)) {
                    return orderItem.some((item) => item.title === title);
                }

                return orderItem.title === title;
            });

            if (indexInMergedOrder >= 0) {
                mergedTotals[indexInMergedOrder] = lastResultRow.data[index];
            }
        });
    }

    return mergedTotals;
};
