import {Field} from 'shared';

import {parseFilterDate} from '../wizard';

jest.mock('../wizard', () => {
    const originalModule = jest.requireActual('../wizard');

    return {
        ...originalModule,
        createVisualizationLayer: () => {},
    };
});
jest.useFakeTimers().setSystemTime(new Date('2023-12-10'));

describe('parseFilterDate', () => {
    it('relative interval(yesterday)', () => {
        const field = {
            filter: {
                value: ['__interval___relative_-1d___relative_-1d'],
                operation: {
                    code: 'BETWEEN',
                },
            },
        } as Field;

        const expectedResult = '09.12.2023 00:00:00-09.12.2023 23:59:59';
        const result = parseFilterDate(field);

        expect(result).toEqual(expectedResult);
    });
});
