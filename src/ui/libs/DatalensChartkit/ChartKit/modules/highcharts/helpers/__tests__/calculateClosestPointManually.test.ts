import {calculateClosestPointManually} from '../index';

describe('calculateClosestPointManually', () => {
    it('return the smallest distance between points and if it is greater than 0', () => {
        const MOCKED_SERIES = [
            {
                processedXData: [1, 5, 12],
            },
            {
                processedXData: [12, 65],
            },
            {
                processedXData: [3, 140],
            },
        ] as any[];

        const MOCKED_CONTEXT = {
            series: MOCKED_SERIES,
        };

        const expectedResult = 2;
        const result = calculateClosestPointManually.apply(MOCKED_CONTEXT);

        expect(result).toEqual(expectedResult);
    });

    it('return undefined if an empty array is passed', () => {
        const MOCKED_CONTEXT = {series: []};
        const result = calculateClosestPointManually.apply(MOCKED_CONTEXT);

        expect(result).toBeUndefined();
    });

    it('return undefined if the smallest distance is 0', () => {
        const MOCKED_SERIES = [
            {
                processedXData: [12],
            },
            {
                processedXData: [12],
            },
        ] as any[];

        const MOCKED_CONTEXT = {
            series: MOCKED_SERIES,
        };

        const result = calculateClosestPointManually.apply(MOCKED_CONTEXT);

        expect(result).toBeUndefined();
    });
});
