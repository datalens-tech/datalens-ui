import cloneDeep from 'lodash/cloneDeep';
import merge from 'lodash/merge';

import {PrepareFunctionArgs} from '../../types';
import {prepareScatter} from '../prepareScatter';

import {COLOR_FIELD, PREPARE_FUNCTION_ARGS, SHAPE_FIELD} from './mocks/scatter.mock';

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

describe('prepareScatter', () => {
    test('should set default marker symbol and color when Shapes and Colors sections is empty', () => {
        const options = getPrepareFunctionArgs();
        const result = prepareScatter(options);
        const items = result.graphs.map((item) => ({marker: item.marker, color: item.color}));

        expect(items).toEqual([
            {
                color: 'blue',
                marker: {
                    symbol: 'circle',
                },
            },
        ]);
    });

    test("should set default marker symbols and different colors when Shapes is empty and Colors isn't empty", () => {
        const options = getPrepareFunctionArgs({
            colors: [COLOR_FIELD],
        });
        const result = prepareScatter(options);
        const items = result.graphs.map((item) => ({marker: item.marker, color: item.color}));

        expect(items).toEqual([
            {
                color: 'blue',
                marker: {
                    symbol: 'circle',
                },
            },
            {
                color: 'red',
                marker: {
                    symbol: 'circle',
                },
            },
        ]);
    });

    test("should set different marker symbols and default color when Colors is empty and Shapes isn't empty", () => {
        const options = getPrepareFunctionArgs({
            shapes: [SHAPE_FIELD],
        });
        const result = prepareScatter(options);
        const items = result.graphs.map((item) => ({marker: item.marker, color: item.color}));

        expect(items).toEqual([
            {
                color: 'blue',
                marker: {
                    symbol: 'circle',
                },
            },
            {
                color: 'blue',
                marker: {
                    symbol: 'diamond',
                },
            },
        ]);
    });

    test("should set different marker symbols and colors when Colors and Shapes aren't empty", () => {
        const options = getPrepareFunctionArgs({
            colors: [COLOR_FIELD],
            shapes: [SHAPE_FIELD],
        });
        const result = prepareScatter(options);
        const items = result.graphs.map((item) => ({marker: item.marker, color: item.color}));

        expect(items).toEqual([
            {
                color: 'blue',
                marker: {
                    symbol: 'circle',
                },
            },
            {
                color: 'blue',
                marker: {
                    symbol: 'diamond',
                },
            },
            {
                color: 'red',
                marker: {
                    symbol: 'circle',
                },
            },
            {
                color: 'red',
                marker: {
                    symbol: 'diamond',
                },
            },
        ]);
    });

    test("should set mounted marker symbols when shapeConfig isn't empty", () => {
        const options = getPrepareFunctionArgs({
            shapes: [SHAPE_FIELD],
            shapesConfig: {
                mountedShapes: {
                    'Shape-1': 'square',
                    'Shape-2': 'triangle-down',
                },
            },
        });
        const result = prepareScatter(options);
        const items = result.graphs.map((item) => ({marker: item.marker, name: item.name}));

        expect(items).toEqual([
            {
                name: 'Shape-1',
                marker: {
                    symbol: 'square',
                },
            },
            {
                name: 'Shape-2',
                marker: {
                    symbol: 'triangle-down',
                },
            },
        ]);
    });
});
