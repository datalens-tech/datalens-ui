import {PrepareFunctionArgs} from '../../types';
import {prepareHighchartsPie} from '../highcharts';
import {preparePie} from '../preparePie';

import {
    dimensionAndMeasure,
    getPrepareFunctionArgs,
    measureNumberAndMeasure,
    measureTextAndMeasure,
    piePrepareForQLArgs,
    piePrepareForQLResult,
} from './mocks/pie.mock';

jest.mock('../../../../../../../registry', () => ({
    registry: {
        getApp() {
            return {nodekit: {ctx: {config: {features: {}}}}};
        },
    },
}));

describe('preparePie', () => {
    test('dimension + measure: colorizing', () => {
        const options = getPrepareFunctionArgs(
            dimensionAndMeasure as unknown as Partial<PrepareFunctionArgs>,
        );

        const result = preparePie(options);
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
        const result = preparePie(options);
        const items = result.graphs[0].data?.map((item) => ({
            colorValue: item.colorValue,
            color: item.color,
        }));

        expect(items).toEqual([
            {color: 'rgb(208, 163, 255)', colorValue: 2},
            {color: 'rgb(107, 50, 201)', colorValue: 1},
        ]);
    });

    test('measure text + measure: colorizing', () => {
        const options = getPrepareFunctionArgs(
            measureTextAndMeasure as unknown as Partial<PrepareFunctionArgs>,
        );
        const result = preparePie(options);
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

describe('prepareHighchartsPie', () => {
    test('should render simple pie correctly', () => {
        const result = prepareHighchartsPie(piePrepareForQLArgs as unknown as PrepareFunctionArgs);

        expect(result).toEqual(piePrepareForQLResult);
    });
});
