import {prepareHighchartsBarX} from '../highcharts';

const {
    barXColoringBaseArgs,
    barXColoringDimensionByGradientArgs,
    barXColoringDimensionByGradientResult,
    barXColoringDimensionByPaletteArgs,
    barXColoringDimensionByPaletteResult,
} = require('./mocks/bar-x.mock');

describe('bar-x preparer', () => {
    describe('bar', () => {
        test('should prepare bar-x with coloring by gradient with dimension', () => {
            const result = prepareHighchartsBarX({
                ...barXColoringBaseArgs,
                ...barXColoringDimensionByGradientArgs,
            });
            expect(result).toEqual(barXColoringDimensionByGradientResult);
        });

        test('should prepare bar-x with coloring by palette with dimension', () => {
            const result = prepareHighchartsBarX({
                ...barXColoringBaseArgs,
                ...barXColoringDimensionByPaletteArgs,
            });
            expect(result).toEqual(barXColoringDimensionByPaletteResult);
        });
    });
});
