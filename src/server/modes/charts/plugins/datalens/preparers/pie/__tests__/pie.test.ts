import type {PrepareFunctionArgs} from '../../types';
import {preparePieData} from '../prepare-pie-data';

import {
    colorFieldDimensionFloat,
    getPrepareFunctionArgs,
    measureField,
    measureNumberAndMeasure,
    measureTextAndMeasure,
    piePrepareBaseArgs,
} from './mocks/pie.mock';

describe('preparePie', () => {
    test('dimension + measure: colorizing', () => {
        const options = getPrepareFunctionArgs(
            piePrepareBaseArgs as unknown as Partial<PrepareFunctionArgs>,
        );

        const result = preparePieData(options);
        const items = result.graphs[0].data?.map((item) => ({
            colorValue: item.colorValue,
            color: item.color,
        }));

        expect(items).toEqual([
            {color: '#4DA2F1', colorValue: '2'},
            {color: '#FF3D64', colorValue: '1'},
        ]);
    });

    test('measure number + measure: colorizing', () => {
        const options = getPrepareFunctionArgs(
            measureNumberAndMeasure as unknown as Partial<PrepareFunctionArgs>,
        );
        const result = preparePieData(options);
        const items = result.graphs[0].data?.map((item) => ({
            colorValue: item.colorValue,
            color: item.color,
        }));

        expect(items).toEqual([
            {
                color: 'rgb(157, 106, 228)',
                colorValue: 2,
            },
        ]);
    });

    test('Fractional values in the "Color" section: the colors specified by the user are used', () => {
        const options = getPrepareFunctionArgs({
            placeholders: [{items: [colorFieldDimensionFloat]}],
            resultData: {
                data: [
                    ['2.0', '3'],
                    ['0.5', '2'],
                    ['1.0', '1'],
                ],
                order: [colorFieldDimensionFloat, measureField],
                totals: [],
            },
            colorsConfig: {
                fieldGuid: colorFieldDimensionFloat.guid,
                availablePalettes: {
                    custom: {id: 'custom', scheme: ['color_0.5', 'color_1.0', 'color_2.0']},
                },
                palette: 'custom',
                mountedColors: {
                    '0.5': '0',
                    '1.0': '1',
                    '2.0': '2',
                },
            },
        } as unknown as PrepareFunctionArgs);
        const result = preparePieData(options);
        const items = result.graphs[0].data?.map((item) => item.color);

        expect(items).toEqual(['color_2.0', 'color_0.5', 'color_1.0']);
    });

    test('measure text + measure: colorizing', () => {
        const options = getPrepareFunctionArgs(
            measureTextAndMeasure as unknown as Partial<PrepareFunctionArgs>,
        );
        const result = preparePieData(options);
        const items = result.graphs[0].data?.map((item) => ({
            colorValue: item.colorValue,
            color: item.color,
        }));

        expect(items).toEqual([
            {color: '#4DA2F1', colorValue: '2'},
            {color: '#FF3D64', colorValue: '1'},
        ]);
    });
});
