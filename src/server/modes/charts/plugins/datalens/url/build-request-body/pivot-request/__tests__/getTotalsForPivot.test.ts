import type {ApiV2RequestPivotTotals, ServerField} from '../../../../../../../../../shared';
import {getTotalsForPivot} from '../helpers/totals';

import {MOCKED_DIMENSION_FIELD} from './mocks/common.mock';
import {MOCKED_DIMENSION_FIELD_WITH_SUB_TOTALS_SETTING} from './mocks/getTotalsForPivot.mock';

jest.mock('../../../../../../../../registry', () => ({
    registry: {
        getApp() {
            return {nodekit: {ctx: {config: {features: {}}}}};
        },
    },
}));

describe('getTotalsForPivot', () => {
    it.each([
        ['columns', {key: 'columnsFields', field: MOCKED_DIMENSION_FIELD_WITH_SUB_TOTALS_SETTING}],
        ['rows', {key: 'rowsFields', field: MOCKED_DIMENSION_FIELD_WITH_SUB_TOTALS_SETTING}],
    ] as ['columns' | 'rows', {key: string; field: ServerField}][])(
        'Should return totals with %s level: 0, when grand totals disabled, but sub-totals for first field exists',
        (type, {key, field}) => {
            const args = {
                isGrandTotalsEnabled: false,
                columnsFields: [],
                rowsFields: [],
                [key]: [field],
            };
            const {settings: result} = getTotalsForPivot(args) as {
                settings: {totals: ApiV2RequestPivotTotals};
            };
            expect(result.totals[type]).toEqual([{level: 0}]);
        },
    );

    it('Should set level, that equal index in array, when field has enabled sub-totals', () => {
        const args = {
            isGrandTotalsEnabled: false,
            columnsFields: [
                MOCKED_DIMENSION_FIELD_WITH_SUB_TOTALS_SETTING,
                MOCKED_DIMENSION_FIELD,
                MOCKED_DIMENSION_FIELD_WITH_SUB_TOTALS_SETTING,
            ],
            rowsFields: [
                MOCKED_DIMENSION_FIELD,
                MOCKED_DIMENSION_FIELD_WITH_SUB_TOTALS_SETTING,
                MOCKED_DIMENSION_FIELD,
                MOCKED_DIMENSION_FIELD_WITH_SUB_TOTALS_SETTING,
            ],
        };

        const {settings: result} = getTotalsForPivot(args) as {
            settings: {totals: ApiV2RequestPivotTotals};
        };

        expect(result.totals.columns).toEqual([{level: 0}, {level: 2}]);
        expect(result.totals.rows).toEqual([{level: 1}, {level: 3}]);
    });
});
