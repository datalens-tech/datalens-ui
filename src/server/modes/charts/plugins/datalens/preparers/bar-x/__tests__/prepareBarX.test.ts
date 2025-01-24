import uniq from 'lodash/uniq';

import {prepareBarX} from '../prepare-bar-x';

import {
    colorField,
    getPrepareFunctionArgs,
    x1Field,
    x2Field,
    yField,
} from './mocks/prepareBarX.mock';

describe('prepareBarX', () => {
    test('two fields in X section -> legendTitle should be constructed as "[X second field name]: [X second field value]"', () => {
        const options = getPrepareFunctionArgs({
            placeholders: [
                {
                    id: 'x',
                    items: [x1Field, x2Field],
                },
                {
                    id: 'y',
                    items: [yField],
                },
            ],
            resultData: {
                data: [
                    ['2023-05-11T00:00:00', 'A', '10'],
                    ['2023-05-11T00:00:00', 'B', '11'],
                    ['2023-05-11T00:00:00', 'A', '15'],
                    ['2023-05-11T00:00:00', 'B', '100'],
                ],
                order: [x1Field, x2Field, yField],
                totals: [],
            },
        });
        const result = prepareBarX(options);
        const items = uniq(result.graphs.map((item) => item.legendTitle));

        expect(items).toEqual(['X2Field: A', 'X2Field: B']);
    });

    test('two fields in X section, second has date type -> legendTitle should be constructed with formatted date value"', () => {
        const options = getPrepareFunctionArgs({
            placeholders: [
                {
                    id: 'x',
                    items: [x2Field, x1Field],
                },
                {
                    id: 'y',
                    items: [yField],
                },
            ],
            resultData: {
                data: [['A', '2023-05-10T00:00:00', '10']],
                order: [x2Field, x1Field, yField],
                totals: [],
            },
        });
        const result = prepareBarX(options);
        const items = uniq(result.graphs.map((item) => item.legendTitle));

        expect(items).toEqual(['X1Field: 10.05.2023']);
    });

    test('two fields in X section and filed in Colors section -> legendTitle should be constructed as "[Color field value]", series id must match the legend title', () => {
        const options = getPrepareFunctionArgs({
            placeholders: [
                {
                    id: 'x',
                    items: [x1Field, x2Field],
                },
                {
                    id: 'y',
                    items: [yField],
                },
            ],
            colors: [colorField],
            resultData: {
                data: [
                    ['2023-05-11T00:00:00', 'A', '10', 'Color-1'],
                    ['2023-05-11T00:00:00', 'B', '11', 'Color-1'],
                    ['2023-05-11T00:00:00', 'A', '15', 'Color-2'],
                    ['2023-05-11T00:00:00', 'B', '100', 'Color-2'],
                ],
                order: [x1Field, x2Field, yField, colorField],
                totals: [],
            },
        });

        const result = prepareBarX(options);
        const legendTitles = uniq(result.graphs.map((item) => item.legendTitle));
        const seriesIds = uniq(result.graphs.map((item) => item.legendTitle));

        expect(legendTitles).toEqual(['Color-1', 'Color-2']);
        expect(seriesIds).toEqual(legendTitles);
    });
});
