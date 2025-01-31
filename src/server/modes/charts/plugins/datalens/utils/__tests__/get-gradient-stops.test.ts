import {GradientType} from '../../../../../../../shared';
import type {ChartColorsConfig} from '../../types';
import {getGradientStops} from '../get-gradient-stops';

describe('getGradientStops', () => {
    const points = [1, 2, 3, 4, 5];

    describe('three point gradient, manual thresholds', () => {
        const colorsConfig = {
            colors: [],
            gradientColors: ['#ffffff', '#808080', '#000000'],
            gradientMode: GradientType.THREE_POINT,
            availablePalettes: {},
            loadedColorPalettes: {},
            thresholdsMode: 'manual',
        } as ChartColorsConfig;
        const testsArgs = [
            {
                title: 'min === minColorValue && max === maxColorValue',
                colorsConfig: {
                    leftThreshold: '1',
                    middleThreshold: '3',
                    rightThreshold: '5',
                },
                result: [
                    [0, 'rgb(255, 255, 255)'],
                    [0.5, 'rgb(128, 128, 128)'],
                    [1, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min === minColorValue && max < maxColorValue',
                colorsConfig: {
                    leftThreshold: '1',
                    middleThreshold: '3',
                    rightThreshold: '4',
                },
                result: [
                    [0, 'rgb(255, 255, 255)'],
                    [0.5, 'rgb(128, 128, 128)'],
                    [0.75, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min > minColorValue && max === maxColorValue',
                colorsConfig: {
                    leftThreshold: '2',
                    middleThreshold: '3',
                    rightThreshold: '5',
                },
                result: [
                    [0.25, 'rgb(255, 255, 255)'],
                    [0.5, 'rgb(128, 128, 128)'],
                    [1, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min > minColorValue && max < maxColorValue',
                colorsConfig: {
                    leftThreshold: '2',
                    middleThreshold: '3',
                    rightThreshold: '4',
                },
                result: [
                    [0.25, 'rgb(255, 255, 255)'],
                    [0.5, 'rgb(128, 128, 128)'],
                    [0.75, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min < minColorValue && max === maxColorValue',
                colorsConfig: {
                    leftThreshold: '0',
                    middleThreshold: '3',
                    rightThreshold: '5',
                },
                result: [
                    [-0.25, 'rgb(255, 255, 255)'],
                    [0.5, 'rgb(128, 128, 128)'],
                    [1, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min === minColorValue && max > maxColorValue',
                colorsConfig: {
                    leftThreshold: '1',
                    middleThreshold: '3',
                    rightThreshold: '6',
                },
                result: [
                    [0, 'rgb(255, 255, 255)'],
                    [0.5, 'rgb(128, 128, 128)'],
                    [1.25, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min < minColorValue && max > maxColorValue',
                colorsConfig: {
                    leftThreshold: '0',
                    middleThreshold: '3',
                    rightThreshold: '6',
                },
                result: [
                    [-0.25, 'rgb(255, 255, 255)'],
                    [0.5, 'rgb(128, 128, 128)'],
                    [1.25, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min > maxColorValue && max > maxColorValue',
                colorsConfig: {
                    leftThreshold: '6',
                    middleThreshold: '7',
                    rightThreshold: '8',
                },
                result: [
                    [1.25, 'rgb(255, 255, 255)'],
                    [1.5, 'rgb(128, 128, 128)'],
                    [1.75, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min < maxColorValue && max < maxColorValue',
                colorsConfig: {
                    leftThreshold: '-2',
                    middleThreshold: '-1',
                    rightThreshold: '0',
                },
                result: [
                    [-0.75, 'rgb(255, 255, 255)'],
                    [-0.5, 'rgb(128, 128, 128)'],
                    [-0.25, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min === minColorValue && min < 0',
                points: [-1, 0, 1, 2, 3],
                colorsConfig: {
                    leftThreshold: '-1',
                    middleThreshold: '1',
                    rightThreshold: '3',
                },
                result: [
                    [0, 'rgb(255, 255, 255)'],
                    [0.5, 'rgb(128, 128, 128)'],
                    [1, 'rgb(0, 0, 0)'],
                ],
            },
        ];

        testsArgs.forEach((testArgs) => {
            const values = testArgs?.points ?? points;
            const minColorValue = Math.min(...values);
            const maxColorValue = Math.max(...values);
            it(testArgs.title, () => {
                const result = getGradientStops({
                    colorsConfig: {...colorsConfig, ...testArgs.colorsConfig},
                    points: values.map((value) => ({colorValue: value})),
                    minColorValue,
                    maxColorValue,
                });

                expect(result).toEqual(testArgs.result);
            });
        });
    });

    describe('two point gradient, manual thresholds', () => {
        const colorsConfig = {
            colors: [],
            gradientColors: ['#ffffff', '#000000'],
            gradientMode: GradientType.TWO_POINT,
            availablePalettes: {},
            loadedColorPalettes: {},
            thresholdsMode: 'manual',
        } as ChartColorsConfig;
        const testsArgs = [
            {
                title: 'min === minColorValue && max === maxColorValue',
                colorsConfig: {
                    leftThreshold: '1',
                    rightThreshold: '5',
                },
                result: [
                    [0, 'rgb(255, 255, 255)'],
                    [1, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min === minColorValue && max < maxColorValue',
                colorsConfig: {
                    leftThreshold: '1',
                    rightThreshold: '4',
                },
                result: [
                    [0, 'rgb(255, 255, 255)'],
                    [0.75, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min > minColorValue && max === maxColorValue',
                colorsConfig: {
                    leftThreshold: '2',
                    rightThreshold: '5',
                },
                result: [
                    [0.25, 'rgb(255, 255, 255)'],
                    [1, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min > minColorValue && max < maxColorValue',
                colorsConfig: {
                    leftThreshold: '2',
                    rightThreshold: '4',
                },
                result: [
                    [0.25, 'rgb(255, 255, 255)'],
                    [0.75, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min < minColorValue && max === maxColorValue',
                colorsConfig: {
                    leftThreshold: '0',
                    rightThreshold: '5',
                },
                result: [
                    [-0.25, 'rgb(255, 255, 255)'],
                    [1, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min === minColorValue && max > maxColorValue',
                colorsConfig: {
                    leftThreshold: '1',
                    rightThreshold: '6',
                },
                result: [
                    [0, 'rgb(255, 255, 255)'],
                    [1.25, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min < minColorValue && max > maxColorValue',
                colorsConfig: {
                    leftThreshold: '0',
                    rightThreshold: '6',
                },
                result: [
                    [-0.25, 'rgb(255, 255, 255)'],
                    [1.25, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min > maxColorValue && max > maxColorValue',
                colorsConfig: {
                    leftThreshold: '6',
                    rightThreshold: '8',
                },
                result: [
                    [1.25, 'rgb(255, 255, 255)'],
                    [1.75, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min < maxColorValue && max < maxColorValue',
                colorsConfig: {
                    leftThreshold: '-2',
                    rightThreshold: '0',
                },
                result: [
                    [-0.75, 'rgb(255, 255, 255)'],
                    [-0.25, 'rgb(0, 0, 0)'],
                ],
            },
            {
                title: 'min === minColorValue && min < 0',
                points: [-1, 0, 1, 2, 3],
                colorsConfig: {
                    leftThreshold: '-1',
                    rightThreshold: '3',
                },
                result: [
                    [0, 'rgb(255, 255, 255)'],
                    [1, 'rgb(0, 0, 0)'],
                ],
            },
        ];

        testsArgs.forEach((testArgs) => {
            const values = testArgs?.points ?? points;
            const minColorValue = Math.min(...values);
            const maxColorValue = Math.max(...values);
            it(testArgs.title, () => {
                const result = getGradientStops({
                    colorsConfig: {...colorsConfig, ...testArgs.colorsConfig},
                    points: values.map((value) => ({colorValue: value})),
                    minColorValue,
                    maxColorValue,
                });

                expect(result).toEqual(testArgs.result);
            });
        });
    });
});
