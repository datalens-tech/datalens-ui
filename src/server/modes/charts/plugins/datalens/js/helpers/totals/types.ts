import {ApiV2ResultDataRow} from '../../../../../../../../shared';
import {PrepareFunctionResultData} from '../../../preparers/types';

export type GetMergedTotalsArgs = {
    isFirstDataset: boolean;
    totals: (string | null)[];
    lastResultRow: ApiV2ResultDataRow;
    currentOrder: {title: string; dataType: string}[];
    mergedOrder: PrepareFunctionResultData['order'];
    resultDataRows: ApiV2ResultDataRow[];
};
