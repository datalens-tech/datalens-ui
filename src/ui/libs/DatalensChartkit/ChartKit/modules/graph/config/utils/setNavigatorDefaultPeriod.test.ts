import type {Highcharts} from '@gravity-ui/chartkit/highcharts';
import type {DATASET_FIELD_TYPES, NavigatorPeriod} from 'shared';

import {getDefaultPeriodInMS} from './setNavigatorDefaultPeriod';

const date1 = new Date('2021-01-01');
const date2 = new Date('2021-01-02');
const date3 = new Date('2021-01-03');

const MOCKED_SERIES = [
    {
        data: [{x: date1.valueOf()}, {x: date3.valueOf()}],
    },
    {
        data: [{x: date2.valueOf()}],
    },
] as Highcharts.Series[];

const DAY_MIN_RANGE = 60 * 60 * 1000 * 24;
const HOUR_MIN_RANGE = 60 * 60 * 1000;

describe('getDefaultPeriodInMS', () => {
    let settings: NavigatorPeriod;
    beforeEach(() => {
        settings = {
            type: 'date' as DATASET_FIELD_TYPES,
            value: '2',
            period: 'day',
        };
    });
    it('return range and minRange for date in milliseconds', () => {
        const result = getDefaultPeriodInMS(settings, MOCKED_SERIES);

        const expectedResult = {
            minRange: DAY_MIN_RANGE,
            range: date3.valueOf() - date1.valueOf(),
        };

        expect(result).toEqual(expectedResult);
    });

    it('returns minRange = 1 hour, if periodSettings type is not date', () => {
        settings.type = 'datetime' as DATASET_FIELD_TYPES;
        const result = getDefaultPeriodInMS(settings, MOCKED_SERIES);

        const expectedResult = {
            minRange: HOUR_MIN_RANGE,
            range: date3.valueOf() - date1.valueOf(),
        };

        expect(result).toEqual(expectedResult);
    });

    it('returns null, if the series is empty', () => {
        const result = getDefaultPeriodInMS(settings, []);

        expect(result).toBeNull();
    });
});
