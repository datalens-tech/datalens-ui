import {calculatePrecision} from './calculatePrecision';

describe('calculatePrecision', () => {
    test('return undefined', () => {
        expect(calculatePrecision(null, {normalizeDiv: false, normalizeSub: false})).toEqual(
            undefined,
        );

        expect(calculatePrecision(null, {normalizeDiv: false, normalizeSub: false}, 1)).toEqual(
            undefined,
        );
    });

    test('should return 2, if normalize options are presented', () => {
        expect(calculatePrecision(null, {normalizeDiv: true, normalizeSub: false}, 99)).toEqual(2);

        expect(calculatePrecision(null, {normalizeDiv: false, normalizeSub: true}, 99.99)).toEqual(
            2,
        );

        expect(calculatePrecision(null, {normalizeDiv: false, normalizeSub: true})).toEqual(2);

        expect(calculatePrecision(10, {normalizeDiv: true, normalizeSub: true})).toEqual(2);
    });

    test('return the passed precision', () => {
        expect(
            calculatePrecision(null, {normalizeDiv: false, normalizeSub: false, precision: 3}),
        ).toEqual(3);

        expect(
            calculatePrecision(
                null,
                {normalizeDiv: true, normalizeSub: false, precision: 4},
                99.99,
            ),
        ).toEqual(4);

        expect(
            calculatePrecision(null, {normalizeDiv: false, normalizeSub: true, precision: 5}, 99),
        ).toEqual(5);

        expect(
            calculatePrecision(10, {normalizeDiv: false, normalizeSub: false, precision: 3}),
        ).toEqual(3);
    });

    test('returns the passed alternativePrecision', () => {
        expect(calculatePrecision(10, {normalizeDiv: false, normalizeSub: false})).toEqual(10);

        expect(calculatePrecision(10, {normalizeDiv: false, normalizeSub: false}, 99)).toEqual(10);

        expect(calculatePrecision(10, {normalizeDiv: false, normalizeSub: false}, 99.99)).toEqual(
            10,
        );
    });

    test('return 2 for fractional numbers default', () => {
        expect(
            calculatePrecision(null, {normalizeDiv: false, normalizeSub: false}, 0.1111111),
        ).toEqual(2);
    });
});
