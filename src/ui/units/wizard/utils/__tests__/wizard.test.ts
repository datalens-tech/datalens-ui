import type {Field} from 'shared';
import {Operations} from 'shared';

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
    it('EQ, absolute value', () => {
        const field = {
            filter: {
                value: ['2017-12-04T00:00:00.000Z'],
                operation: {
                    code: Operations.EQ,
                },
            },
        } as Field;

        const expectedResult = '04.12.2017 00:00:00';
        const result = parseFilterDate(field);

        expect(result).toEqual(expectedResult);
    });

    it('EQ, relative value', () => {
        const field = {
            filter: {
                value: ['__relative_-1d'],
                operation: {
                    code: Operations.EQ,
                },
            },
        } as Field;

        const expectedResult = '09.12.2023 00:00:00';
        const result = parseFilterDate(field);

        expect(result).toEqual(expectedResult);
    });

    it('BETWEEN, absolute interval', () => {
        const field = {
            filter: {
                value: ['__interval_2023-12-11T00:00:00.000Z_2023-12-13T00:00:00.000Z'],
                operation: {
                    code: Operations.BETWEEN,
                },
            },
        } as Field;

        const expectedResult = '11.12.2023 00:00:00-13.12.2023 00:00:00';
        const result = parseFilterDate(field);

        expect(result).toEqual(expectedResult);
    });

    it('BETWEEN, relative interval', () => {
        const field = {
            filter: {
                value: ['__interval___relative_-1d___relative_-1d'],
                operation: {
                    code: Operations.BETWEEN,
                },
            },
        } as Field;

        const expectedResult = '09.12.2023 00:00:00-09.12.2023 23:59:59';
        const result = parseFilterDate(field);

        expect(result).toEqual(expectedResult);
    });
});
