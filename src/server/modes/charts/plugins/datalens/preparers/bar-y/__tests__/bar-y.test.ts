import pick from 'lodash/pick';

import {AxisMode} from '../../../../../../../../shared';
import {DateTimeField, EmptyPrepapreArgs, IntegerField} from '../../__tests__/common.mock';
import {PrepareFunctionArgs} from '../../types';
import {prepareBarYData} from '../prepare-bar-y-data';

const DimensionField = {...IntegerField, type: 'DIMENSION', guid: 'DimensionField_guid'};

describe('prepareBarYData', () => {
    const args: PrepareFunctionArgs = {
        ...EmptyPrepapreArgs,
        idToTitle: {
            [IntegerField.guid]: IntegerField.title,
            [DateTimeField.guid]: DateTimeField.title,
            [DimensionField.guid]: DimensionField.title,
        },
    };

    test('X is empty, Y has integer field -> categories contain values from the Y field', () => {
        const result = prepareBarYData({
            ...args,
            placeholders: [
                {
                    id: 'y',
                    items: [IntegerField],
                },
                {
                    id: 'x',
                    items: [],
                },
            ],
            resultData: {
                data: [['11'], ['222']],
                order: [IntegerField],
                totals: [],
            },
        });
        expect(result.categories).toEqual([11, 222]);
    });

    test('X is empty, Y has datetime field -> categories_ms contains values from the Y field', () => {
        const result = prepareBarYData({
            ...args,
            placeholders: [
                {
                    id: 'y',
                    items: [DateTimeField],
                    settings: {
                        axisModeMap: {
                            [DateTimeField.guid]: AxisMode.Continuous,
                        },
                    },
                },
                {
                    id: 'x',
                    items: [],
                },
            ],
            resultData: {
                data: [['2023-09-17T00:00:00.000Z'], ['2023-09-18T00:00:00.000Z']],
                order: [DateTimeField],
                totals: [],
            },
        });
        expect(result.categories_ms).toEqual([1694908800000, 1694995200000]);
    });

    test('X is not empty, Y has datetime field -> categories and categories_ms are undefined, result contain one graph', () => {
        const result = prepareBarYData({
            ...args,
            placeholders: [
                {
                    id: 'y',
                    items: [DateTimeField],
                    settings: {
                        axisModeMap: {
                            [DateTimeField.guid]: AxisMode.Continuous,
                        },
                    },
                },
                {
                    id: 'x',
                    items: [DimensionField],
                },
            ],
            resultData: {
                data: [
                    ['2023-09-17T00:00:00.000Z', '100'],
                    ['2023-09-18T00:00:00.000Z', '200'],
                ],
                order: [DateTimeField, DimensionField],
                totals: [],
            },
        });
        expect(result.categories).not.toBeDefined();
        expect(result.categories_ms).not.toBeDefined();
        expect(result.graphs.map((g) => pick(g, 'data'))).toEqual([
            {
                data: [
                    {y: 100, x: 1694908800000},
                    {y: 200, x: 1694995200000},
                ],
            },
        ]);
    });
});
