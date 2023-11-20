import {prepareHighchartsBarX} from '../highcharts';

const {
    barXColoringWithGradientByDimensionArgs,
    barXColoringWithGradientByDimensionResult,
} = require('./mocks/bar-x.mock');

describe('bar-x preparer', () => {
    describe('bar', () => {
        test('should prepare bar-x with coloring by gradient with dimension', () => {
            const result = prepareHighchartsBarX(barXColoringWithGradientByDimensionArgs);
            expect(result).toEqual(barXColoringWithGradientByDimensionResult);
        });
    });
});
