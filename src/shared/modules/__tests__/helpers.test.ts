import MockDate from 'mockdate';

import {prepareFilterValuesWithOperations} from '../helpers';

MockDate.set('2020-02-14T22:34:55.359Z');

describe('prepareFilterValuesWithOperations', () => {
    test('should return an array of filter values and operation (IN or BETWEEN for the date by default)', () => {
        const result1 = prepareFilterValuesWithOperations({
            values: ['__relative_-1M'],
        });

        expect(result1).toEqual({
            values: ['2020-01-14T00:00:00.000Z'],
            operations: ['IN'],
        });

        const result2 = prepareFilterValuesWithOperations({
            values: ['robot'],
        });

        expect(result2).toEqual({
            values: ['robot'],
            operations: ['IN'],
        });
    });

    test('for an interval, should return the BETWEEN operator and an array value specifying the range', () => {
        const expectedResult = {
            operations: ['BETWEEN'],
            values: [['2021-08-18T00:00:00.000Z', '2021-08-20T23:59:59.999Z']],
        };

        expect(
            prepareFilterValuesWithOperations({
                values: ['__interval_2021-08-18T00:00:00.000Z_2021-08-20T23:59:59.999Z'],
            }),
        ).toEqual(expectedResult);
    });

    test('should return an array of filter values and operation (specified in values)', () => {
        const result = prepareFilterValuesWithOperations({
            values: ['__eq_2'],
        });

        expect(result).toEqual({
            values: ['2'],
            operations: ['EQ'],
        });
    });

    test('if the operation is not defined, the function must return the passed value as is and select the default operation (IN)', () => {
        const result1 = prepareFilterValuesWithOperations({
            values: [''],
        });

        expect(result1).toEqual({
            values: [''],
            operations: ['IN'],
        });

        const result2 = prepareFilterValuesWithOperations({
            values: ['Value without operator'],
        });

        expect(result2).toEqual({
            values: ['Value without operator'],
            operations: ['IN'],
        });
    });
});
