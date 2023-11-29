import linePrepare from '../index';

const {
    regularTitle,
    calculatedTitle,
    preparingDataForFieldsWithSameTitlesFromDifferentDatasets,
} = require('./mocks/bar.mock');
const {
    linesColoredByFieldWithPostfixArgs,
    linesColoredByFieldWithPostfixResult,
} = require('./mocks/line.mock');

describe('line preparer', () => {
    describe('bar', () => {
        test('should has regular title in case with one field in X section', () => {
            const result = linePrepare(regularTitle);
            expect(result.graphs[0].legendTitle).toEqual('Sales');
        });

        test('should has calculated title in case with two fields in X section', () => {
            const result = linePrepare(calculatedTitle);
            expect(result.graphs[0].legendTitle).toEqual('Sales: Central');
        });

        test('data of indicators with the same titles from different datasets', () => {
            const result = linePrepare(preparingDataForFieldsWithSameTitlesFromDifferentDatasets);
            expect(result.graphs[0].data[0].y * 2).toEqual(result.graphs[1].data[0].y);
            expect(result.graphs[0].data[5].y * 2).toEqual(result.graphs[1].data[5].y);
        });
    });

    describe('line', () => {
        test('should apply colors and shapes to fields with prefixes/postfixes', () => {
            const result = linePrepare(linesColoredByFieldWithPostfixArgs);
            console.log(result);
            expect(result).toEqual(linesColoredByFieldWithPostfixResult);
        });
    });
});
