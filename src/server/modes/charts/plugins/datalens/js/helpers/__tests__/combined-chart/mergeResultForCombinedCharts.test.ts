import {mergeResultForCombinedCharts} from '../../layer-chart';

describe('mergeResultForCombinedCharts', () => {
    it('Should merge all results into one graphs array', () => {
        const mockedResults = [
            {graphs: [{name: 'Test', data: [1, 2, 3, 4]}]},
            {graphs: [{name: 'Test 2', data: [{x: 1, y: 5}]}]},
        ];

        const result = mergeResultForCombinedCharts(mockedResults);

        expect(result).toEqual({
            graphs: [
                {name: 'Test', data: [1, 2, 3, 4]},
                {name: 'Test 2', data: [{x: 1, y: 5}]},
            ],
        });
    });

    it('Should remove empty graph', () => {
        const mockedResults = [
            {graphs: [{name: 'Test', data: [1, 2, 3, 4]}]},
            {graphs: [{name: 'Test 2', data: [{x: 1, y: 5}]}]},
            {graphs: [{name: 'Test 3', data: [null, null, null]}]},
            {graphs: [{name: 'Test 4', data: []}]},
        ];

        const result = mergeResultForCombinedCharts(mockedResults);

        expect(result).toEqual({
            graphs: [
                {name: 'Test', data: [1, 2, 3, 4]},
                {name: 'Test 2', data: [{x: 1, y: 5}]},
            ],
        });
    });

    it('Should return first empty chart when all graphs without data', () => {
        const mockedResults = [
            {graphs: [{name: 'Test 1', data: [null, null, null]}]},
            {graphs: [{name: 'Test 2', data: [null, null, null]}]},
            {graphs: [{name: 'Test 3', data: [null, null, null]}]},
            {graphs: [{name: 'Test 4', data: []}]},
        ];

        const result = mergeResultForCombinedCharts(mockedResults);

        expect(result).toEqual({
            graphs: [{name: 'Test 1', data: [null, null, null]}],
        });
    });

    it('Should remove categories_ms when one chart with data exists', () => {
        const mockedResults = [
            {
                graphs: [{name: 'Test 1', data: [null, null, null]}],
                categories_ms: [12321421, 124242151],
            },
            {graphs: [{name: 'Test 2', data: [1, 2, 3, 4]}]},
        ];

        const result = mergeResultForCombinedCharts(mockedResults);

        expect(result).toEqual({graphs: [{name: 'Test 2', data: [1, 2, 3, 4]}]});
    });
});
