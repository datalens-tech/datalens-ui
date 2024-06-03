import type {ApiV2RequestPivotTotals} from '../../../../../../../../../shared';
import {getPivotTableSubTotals} from '../../../../utils/pivot-table/totals';

import type {GetTotalsForPivotArgs} from './types';

export const getTotalsForPivot = ({
    rowsFields,
    columnsFields,
}: GetTotalsForPivotArgs): {
    settings: {totals: ApiV2RequestPivotTotals};
} => {
    return {
        settings: {
            totals: getPivotTableSubTotals({rowsFields, columnsFields}),
        },
    };
};
