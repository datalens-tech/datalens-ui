import type {Highcharts} from '@gravity-ui/chartkit/highcharts';

import {getXAxisThresholdValue} from './getXAxisThresholdValue';

const MOCKED_SERIES = [
    {data: [{x: 1}, {x: 2}, {x: -11}, {x: 0}, {x: 1}]},
    {data: [{x: 100}, {x: -1232}]},
    {data: []},
] as Highcharts.Series[];

describe('getXAxisThresholdValue', () => {
    it('should return the maximum value on X axis if max operation', () => {
        const result = getXAxisThresholdValue(MOCKED_SERIES, 'max');
        expect(result).toEqual(100);
    });

    it('should return minimum value on X axis if operation min', () => {
        const result = getXAxisThresholdValue(MOCKED_SERIES, 'min');
        expect(result).toEqual(-1232);
    });

    it.each([['min'], ['max']])('should return null if series is empty array', (operation) => {
        const result = getXAxisThresholdValue([], operation as 'min' | 'max');
        expect(result).toBeNull();
    });
});
