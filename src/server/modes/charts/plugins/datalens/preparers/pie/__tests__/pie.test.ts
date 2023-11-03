import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import {PrepareFunctionArgs} from '../../types';
import {preparePie} from '../preparePie';

import {
    PREPARE_FUNCTION_ARGS,
    SET_WITH_DIMENSION_AND_MEASURE,
    SET_WITH_MEASURE_NUMBER_AND_MEASURE,
    SET_WITH_MEASURE_TEXT_AND_MEASURE,
} from './mocks/pie.mock';

jest.mock('../../../../../../../registry', () => ({
    registry: {
        getApp() {
            return {nodekit: {ctx: {config: {features: {}}}}};
        },
    },
}));

function getPrepareFunctionArgs(options: Partial<PrepareFunctionArgs> = {}) {
    return merge(cloneDeep(PREPARE_FUNCTION_ARGS), options) as unknown as PrepareFunctionArgs;
}

describe('preparePie', () => {
    test('dimension + measure: colorizing', () => {
        const options = getPrepareFunctionArgs(
            SET_WITH_DIMENSION_AND_MEASURE as unknown as Partial<PrepareFunctionArgs>,
        );

        const result = preparePie(options);
        const items = result.graphs[0].data?.map((item) => ({
            colorValue: item.colorValue,
            color: item.color,
        }));

        expect(items).toEqual([
            {color: '#4DA2F1', colorValue: '1'},
            {color: '#FF3D64', colorValue: '2'},
        ]);
    });

    test('measure number + measure: colorizing', () => {
        const options = getPrepareFunctionArgs(
            SET_WITH_MEASURE_NUMBER_AND_MEASURE as unknown as Partial<PrepareFunctionArgs>,
        );
        const result = preparePie(options);
        const items = result.graphs[0].data?.map((item) => ({
            colorValue: item.colorValue,
            color: item.color,
        }));

        expect(items).toEqual([
            {color: 'rgb(107, 50, 201)', colorValue: 1},
            {color: 'rgb(208, 163, 255)', colorValue: 2},
        ]);
    });

    test('measure text + measure: colorizing', () => {
        const options = getPrepareFunctionArgs(
            SET_WITH_MEASURE_TEXT_AND_MEASURE as unknown as Partial<PrepareFunctionArgs>,
        );
        const result = preparePie(options);
        const items = result.graphs[0].data?.map((item) => ({
            colorValue: item.colorValue,
            color: item.color,
        }));

        expect(items).toEqual([
            {color: '#4DA2F1', colorValue: '1'},
            {color: '#FF3D64', colorValue: '2'},
        ]);
    });
});
