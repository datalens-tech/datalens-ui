import {GradientType} from '../../../../../../../../../../shared';
import type {ChartColorsConfig} from '../../../../../types';
import {colorizeFlatTableColumn} from '../../background-settings';

const getBlueGradientColors = () => ['#0044A3', '#8CCBFF'];

const getRedOrangeGreenGradientColors = () => ['#FF3D64', '#FFC636', '#54A520'];

const removeLineBreaksAndSpace = (arr: (string | null)[]) =>
    arr.map((v) => (v ? v.replace(/[\r\n\s]/gm, '') : v));

describe('colorizeFlatTableColumn', () => {
    it('Should return array of rgb colors', () => {
        const data = [['0'], ['1'], ['2'], ['3']];
        const index = 0;
        const colorsConfig: ChartColorsConfig = {
            gradientMode: GradientType.TWO_POINT,
            gradientPalette: 'blue',
            reversed: false,
            colors: [],
            gradientColors: getBlueGradientColors(),
            loadedColorPalettes: {},
            availablePalettes: {},
        };

        const result = colorizeFlatTableColumn({data, colorsConfig, index});

        expect(removeLineBreaksAndSpace(result)).toEqual([
            'rgb(0,68,163)',
            'rgb(47,113,194)',
            'rgb(93,158,224)',
            'rgb(140,203,255)',
        ]);
    });

    it('Should return array with one rgb color as max value for 2-point gradient', () => {
        const data = [['5']];
        const index = 0;
        const colorsConfig: ChartColorsConfig = {
            gradientMode: GradientType.TWO_POINT,
            gradientPalette: 'blue',
            reversed: false,
            colors: [],
            gradientColors: getBlueGradientColors(),
            loadedColorPalettes: {},
            availablePalettes: {},
        };

        const result = colorizeFlatTableColumn({data, colorsConfig, index});

        expect(removeLineBreaksAndSpace(result)).toEqual(['rgb(140,203,255)']);
    });

    it('Should return array with one rgb color as max value for 3-point gradient', () => {
        const data = [['5']];
        const index = 0;
        const colorsConfig: ChartColorsConfig = {
            gradientMode: GradientType.THREE_POINT,
            gradientPalette: 'red-orange-green',
            reversed: false,
            colors: [],
            gradientColors: getRedOrangeGreenGradientColors(),
            loadedColorPalettes: {},
            availablePalettes: {},
        };

        const result = colorizeFlatTableColumn({data, colorsConfig, index});

        expect(removeLineBreaksAndSpace(result)).toEqual(['rgb(84,165,32)']);
    });

    it('Some rows do not have data for the column -> calculate the gradient only from non-empty values', () => {
        const data = [[], ['0.5'], ['1.5']];
        const index = 0;
        const colorsConfig: ChartColorsConfig = {
            gradientMode: GradientType.TWO_POINT,
            gradientPalette: 'blue',
            reversed: false,
            colors: [],
            gradientColors: getBlueGradientColors(),
            loadedColorPalettes: {},
            availablePalettes: {},
        };

        const result = colorizeFlatTableColumn({data, colorsConfig, index});

        expect(removeLineBreaksAndSpace(result)).toEqual([
            null,
            'rgb(0,68,163)', // min possible value
            'rgb(140,203,255)', // max possible value
        ]);
    });
});
