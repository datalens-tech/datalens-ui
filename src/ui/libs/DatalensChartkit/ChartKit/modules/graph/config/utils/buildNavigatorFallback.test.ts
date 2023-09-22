import {buildNavigatorFallback} from './buildNavigatorFallback';

const MOCKED_GRAPHS = [{name: 'Test'}, {name: 'Test1'}, {name: 'Test2'}];
const baseSeriesName = 'Test2';
const missedSeriesName = 'Test3';

describe('buildNavigatorFallback', () => {
    it('should set showInNavigator = true if baseSeriesName is presented, for selected line', () => {
        const expectedResult = [
            {name: 'Test', showInNavigator: false},
            {name: 'Test1', showInNavigator: false},
            {name: 'Test2', showInNavigator: true},
        ];
        buildNavigatorFallback(MOCKED_GRAPHS, baseSeriesName);

        expect(MOCKED_GRAPHS).toEqual(expectedResult);
    });

    it('should set showInNavigator = true for all lines, if baseSeries === undefined', () => {
        const expectedResult = [
            {name: 'Test', showInNavigator: true},
            {name: 'Test1', showInNavigator: true},
            {name: 'Test2', showInNavigator: true},
        ];

        buildNavigatorFallback(MOCKED_GRAPHS);

        expect(MOCKED_GRAPHS).toEqual(expectedResult);
    });

    it('should not set showInNavigator, if baseSeriesName is not found in graphs', () => {
        buildNavigatorFallback(MOCKED_GRAPHS, missedSeriesName);

        expect(MOCKED_GRAPHS).toEqual(MOCKED_GRAPHS);
    });
});
