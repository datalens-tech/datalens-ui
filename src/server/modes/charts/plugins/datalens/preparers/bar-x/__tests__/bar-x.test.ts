import {prepareHighchartsBarX} from '../highcharts';

const {
    barXColoringBaseArgs,
    barXColoringDimensionByGradientArgs,
    barXColoringDimensionByGradientResult,
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
    });
});
