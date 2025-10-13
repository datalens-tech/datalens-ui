import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import type {PrepareFunctionArgs} from '../../types';
import {DEFAULT_ICON_COLOR} from '../constants';
import prepareGeopoint from '../index';
import type {GeopointPointConfig} from '../types';

import {
    COORDINATES_FIELD,
    DIMENSION_COLOR_FIELD,
    MEASURE_COLOR_FIELD,
    PREPARE_FUNCTION_ARGS,
} from './mocks/geopoints.mock';

function getPrepareFunctionArgs(options: Partial<PrepareFunctionArgs> = {}) {
    return merge(cloneDeep(PREPARE_FUNCTION_ARGS), options) as unknown as PrepareFunctionArgs;
}

describe('prepareGeopoint', () => {
    test('Color field is empty: should use default color', () => {
        const options = getPrepareFunctionArgs({
            colors: [],
            resultData: {
                data: [
                    ['[43.2050370,76.6612660]'],
                    ['[43.2050370,76.6612660]'],
                    ['[40.2050370,76.6612660]'],
                    [null],
                ],
                order: [COORDINATES_FIELD],
            } as unknown as PrepareFunctionArgs['resultData'],
        });
        const result = prepareGeopoint(options);

        const points = result
            .map((item) => (item as any).collection.children)
            .flat(2) as GeopointPointConfig[];
        const pointColors = points.map((point) => ({iconColor: point.options.iconColor}));

        expect(pointColors).toEqual([
            {iconColor: DEFAULT_ICON_COLOR},
            {iconColor: DEFAULT_ICON_COLOR},
            {iconColor: DEFAULT_ICON_COLOR},
        ]);
        expect(result[0].options?.colorDictionary).not.toBeDefined();
    });

    test('Colorize by dimension, colorsConfig empty: should use different colors', () => {
        const options = getPrepareFunctionArgs({
            colors: [DIMENSION_COLOR_FIELD],
            colorsConfig: {} as unknown as PrepareFunctionArgs['colorsConfig'],
            resultData: {
                data: [
                    ['[43.2050370,76.6612660]', 'Color1'],
                    ['[42.2050370,76.6612660]', 'Color2'],
                    ['[41.2050370,76.6612660]', 'Color3'],
                    [null, null],
                ],
                order: [COORDINATES_FIELD, DIMENSION_COLOR_FIELD],
            } as unknown as PrepareFunctionArgs['resultData'],
        });
        const result = prepareGeopoint(options);

        const points = result
            .map((item) => (item as any).collection.children)
            .flat(2) as GeopointPointConfig[];
        const pointColors = points.map((point) => ({iconColor: point.options.iconColor}));

        expect(pointColors).toEqual([
            {iconColor: 'defaultColor'},
            {iconColor: 'blue'},
            {iconColor: 'red'},
        ]);
        expect(result[0].options?.colorDictionary).toEqual({
            Color1: 'defaultColor',
            Color2: 'blue',
            Color3: 'red',
        });
    });

    test('Colorize by dimension, colorsConfig not empty: should use different colors for same coordinates, different color values', () => {
        const options = getPrepareFunctionArgs({
            colors: [DIMENSION_COLOR_FIELD],
            colorsConfig: {
                fieldGuid: DIMENSION_COLOR_FIELD.guid,
                mountedColors: {
                    Color1: '2',
                    Color2: '1',
                },
            } as unknown as PrepareFunctionArgs['colorsConfig'],
            resultData: {
                data: [
                    ['[43.2050370,76.6612660]', 'Color1'],
                    ['[43.2050370,76.6612660]', 'Color2'],
                    ['[43.2050370,76.6612660]', 'Color3'],
                    [null, null],
                ],
                order: [COORDINATES_FIELD, DIMENSION_COLOR_FIELD],
            } as unknown as PrepareFunctionArgs['resultData'],
        });
        const result = prepareGeopoint(options);

        const points = result
            .map((item) => (item as any).collection.children)
            .flat(2) as GeopointPointConfig[];
        const pointColors = points.map((point) => ({iconColor: point.options.iconColor}));

        expect(pointColors).toEqual([
            {iconColor: 'red'},
            {iconColor: 'blue'},
            {iconColor: 'defaultColor'},
        ]);
        expect(result[0].options?.colorDictionary).toEqual({
            Color1: 'red',
            Color2: 'blue',
            Color3: 'defaultColor',
        });
    });

    test('Colorize by measure: should use different colors for same coordinates, different color values', () => {
        const options = getPrepareFunctionArgs({
            colors: [MEASURE_COLOR_FIELD],
            colorsConfig: {
                gradientMode: '2-point',
                gradientPalette: 'blue',
                gradientColors: ['#0044A3', '#8CCBFF'],
            } as unknown as PrepareFunctionArgs['colorsConfig'],
            resultData: {
                data: [
                    ['[40.2050370,76.6612660]', '1'],
                    ['[40.2050370,76.6612660]', '10.0'],
                ],
                order: [COORDINATES_FIELD, MEASURE_COLOR_FIELD],
            } as unknown as PrepareFunctionArgs['resultData'],
        });
        const result = prepareGeopoint(options);

        const points = result
            .map((item) => (item as any).collection.children)
            .flat(2) as GeopointPointConfig[];
        const pointColors = points.map((point) => ({
            iconColor: point.options.iconColor.replace(/[ \n]+/g, ''),
        }));

        const gradientColor1 = 'rgb(0,68,163)';
        const gradientColor2 = 'rgb(140,203,255)';
        expect(pointColors).toEqual([
            {
                iconColor: gradientColor1,
            },
            {
                iconColor: gradientColor2,
            },
        ]);
    });
});
