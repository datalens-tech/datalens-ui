import {NavigatorLinesMode} from 'shared';

import {addShowInNavigatorToSeries} from './addShowInNavigatorToSeries';

describe('addShowInNavigatorToSeries', () => {
    let MOCKED_SERIES: Record<string, any>[];
    let MOCKED_PARAMS: Record<string, any>;

    beforeEach(() => {
        MOCKED_SERIES = [{name: 'Test1'}, {name: 'Test2'}, {name: 'Test3'}];
        MOCKED_PARAMS = {navigator: {}};
    });

    it('should set showInNavigator = true for all series, if linesMode = All', () => {
        const linesMode = NavigatorLinesMode.All;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: [],
            baseSeriesName: '',
        });

        const expectedResult = [
            {name: 'Test1', showInNavigator: true},
            {name: 'Test2', showInNavigator: true},
            {name: 'Test3', showInNavigator: true},
        ];

        expect(MOCKED_SERIES).toEqual(expectedResult);
    });

    it('should set showInNavigator = false for all series and add min,max in params.navigator.xAxis, if linesMode === Selected and selectedLines is empty', () => {
        const linesMode = NavigatorLinesMode.Selected;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: [],
            baseSeriesName: '',
        });

        const expectedSeries = [
            {name: 'Test1', showInNavigator: false},
            {name: 'Test2', showInNavigator: false},
            {name: 'Test3', showInNavigator: false},
        ];

        const expectedParams = {
            navigator: {
                xAxis: {
                    max: null,
                    min: null,
                },
            },
        };

        expect(MOCKED_SERIES).toEqual(expectedSeries);
        expect(MOCKED_PARAMS).toEqual(expectedParams);
    });

    it('should set showInNavigator = true, if series contains selectedLines', () => {
        const linesMode = NavigatorLinesMode.Selected;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: ['Test3'],
            baseSeriesName: '',
        });

        const expectedSeries = [
            {name: 'Test1', showInNavigator: false},
            {name: 'Test2', showInNavigator: false},
            {name: 'Test3', showInNavigator: true},
        ];

        expect(MOCKED_SERIES).toEqual(expectedSeries);
    });

    it('should set showInNavigator = true, if series === baseSeriesName', () => {
        const linesMode = NavigatorLinesMode.Selected;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: [],
            baseSeriesName: 'Test2',
        });

        const expectedSeries = [
            {name: 'Test1', showInNavigator: false},
            {name: 'Test2', showInNavigator: true},
            {name: 'Test3', showInNavigator: false},
        ];

        expect(MOCKED_SERIES).toEqual(expectedSeries);
    });

    it('should set showInNavigator = true, if selectedLines and baseSeriesName are presented', () => {
        const linesMode = NavigatorLinesMode.Selected;

        addShowInNavigatorToSeries({
            linesMode,
            graphs: MOCKED_SERIES,
            params: MOCKED_PARAMS,
            selectedLines: ['Test1'],
            baseSeriesName: 'Test2',
        });

        const expectedSeries = [
            {name: 'Test1', showInNavigator: true},
            {name: 'Test2', showInNavigator: true},
            {name: 'Test3', showInNavigator: false},
        ];

        expect(MOCKED_SERIES).toEqual(expectedSeries);
    });
});
