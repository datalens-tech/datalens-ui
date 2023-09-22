import {getMergedTotals} from '../../totals';
import {
    FIRST_DATASET_CURRENT_ORDER,
    FIRST_DATASET_LAST_RESULT_ROW,
    FIRST_DATASET_LOADED_DATA_ROWS,
    FIRST_DATASET_MERGED_ORDER,
    SECOND_DATASET_CURRENT_ORDER,
    SECOND_DATASET_LAST_RESULT_ROW,
    SECOND_DATASET_LOADED_DATA_ROWS,
    SECOND_DATASET_MERGED_ORDER,
} from '../mocks/totals/getMergedTotals.mock';

describe('getMergedTotals', () => {
    it('merge all totals into one array if data came from only one dataset', () => {
        const mergedTotals = getMergedTotals({
            mergedOrder: FIRST_DATASET_MERGED_ORDER,
            lastResultRow: FIRST_DATASET_LAST_RESULT_ROW,
            isFirstDataset: true,
            totals: [],
            currentOrder: FIRST_DATASET_CURRENT_ORDER,
            resultDataRows: FIRST_DATASET_LOADED_DATA_ROWS,
        });

        expect(mergedTotals).toEqual(['', '250']);
    });

    it('Merge all totals depending on the mergedOrder array if multiple datasets', () => {
        let mergedTotals: (string | null)[] = [];

        const mergedTotalsArgs = [
            // The first dataset
            {
                mergedOrder: FIRST_DATASET_MERGED_ORDER,
                lastResultRow: FIRST_DATASET_LAST_RESULT_ROW,
                isFirstDataset: true,
                currentOrder: FIRST_DATASET_CURRENT_ORDER,
                resultDataRows: FIRST_DATASET_LOADED_DATA_ROWS,
            },
            {
                mergedOrder: SECOND_DATASET_MERGED_ORDER,
                lastResultRow: SECOND_DATASET_LAST_RESULT_ROW,
                isFirstDataset: false,
                currentOrder: SECOND_DATASET_CURRENT_ORDER,
                resultDataRows: SECOND_DATASET_LOADED_DATA_ROWS,
            },
        ];

        mergedTotalsArgs.forEach((args) => {
            mergedTotals = getMergedTotals({...args, totals: mergedTotals});
        });

        expect(mergedTotals.slice(0, 3)).toEqual(['', '250', '600']);
    });
});
