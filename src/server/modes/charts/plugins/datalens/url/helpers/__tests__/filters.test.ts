import type {PayloadFilter} from '../../../../../../../../shared';
import {getMergedChartAndParamsFilters} from '../filters';

describe('getMergedChartAndParamsFilters', () => {
    it('should return list of filter parameters and chart filters without duplicates', () => {
        const paramsFilters: PayloadFilter[] = [
            {
                column: 'dataset-field-guid-1',
                values: ['params-value'],
                operation: 'IN',
            },
            {
                column: 'dataset-field-guid-2',
                values: ['params-value-2'],
                operation: 'IN',
            },
        ];
        const chartFilters: PayloadFilter[] = [
            {
                column: 'dataset-field-guid-1',
                values: ['chart-value'],
                operation: 'EQ',
            },
            {
                column: 'dataset-field-guid-3',
                values: ['chart-value-3'],
                operation: 'GTE',
            },
        ];

        const expectedResult = [
            {
                column: 'dataset-field-guid-3',
                values: ['chart-value-3'],
                operation: 'GTE',
            },
            {
                column: 'dataset-field-guid-1',
                values: ['params-value'],
                operation: 'IN',
            },
            {
                column: 'dataset-field-guid-2',
                values: ['params-value-2'],
                operation: 'IN',
            },
        ];

        const result = getMergedChartAndParamsFilters({paramsFilters, chartFilters});

        expect(result).toEqual(expectedResult);
    });

    it('should remove all duplicate filters of the chart if there is the same guid in the filter parameters', () => {
        const paramsFilters: PayloadFilter[] = [
            {
                column: 'dataset-field-guid-1',
                values: ['params-value'],
                operation: 'IN',
            },
        ];
        const chartFilters: PayloadFilter[] = [
            {
                column: 'dataset-field-guid-1',
                values: ['chart-value-1'],
                operation: 'EQ',
            },
            {
                column: 'dataset-field-guid-1',
                values: ['chart-value-1-next'],
                operation: 'GTE',
            },
        ];

        const expectedResult = [
            {
                column: 'dataset-field-guid-1',
                values: ['params-value'],
                operation: 'IN',
            },
        ];

        const result = getMergedChartAndParamsFilters({chartFilters, paramsFilters});

        expect(result).toEqual(expectedResult);
    });

    it('should return chart filters if there are no parameter filters.', () => {
        const paramsFilters: PayloadFilter[] = [];
        const chartFilters: PayloadFilter[] = [
            {
                column: 'dataset-field-guid-1',
                values: ['chart-value'],
                operation: 'EQ',
            },
            {
                column: 'dataset-field-guid-2',
                values: ['chart-value-2'],
                operation: 'IN',
            },
            {
                column: 'dataset-field-guid-3',
                values: ['chart-value-3'],
                operation: 'GTE',
            },
        ];

        const result = getMergedChartAndParamsFilters({chartFilters, paramsFilters});

        expect(result).toEqual(chartFilters);
    });
});
