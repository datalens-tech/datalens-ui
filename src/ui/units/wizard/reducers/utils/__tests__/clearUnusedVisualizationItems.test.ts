import type {ColorsConfig, Field, ShapesConfig, Sort} from 'shared';

import type {VisualizationFields} from '../clearUnusedVisualizationItems';
import {prepareCommonPlaceholderItems} from '../clearUnusedVisualizationItems';
import {clearUnusedVisualizationItems} from '../index';

const MOCKED_SHAPES_CONFIG = {
    field_guid: 'Dash',
} as ShapesConfig;

const MOCKED_COLORS_CONFIG = {
    field_guid: '#8AD554',
} as ColorsConfig;

const MOCKED_COLORS = [{type: 'DIMENSION'} as Field];

const MOCKED_SHAPES = [{type: 'DIMENSION'} as Field];

const MOCKED_SORT = [{type: 'MEASURE'} as Sort];

const MOCKED_LABELS = [{mode: 'percent'} as Field];

const MOCKED_SEGMENTS = [{type: 'DIMENSION'} as Field];

jest.mock('./../../../utils/wizard', () => {
    return {
        createVisualizationLayer: () => ({}),
    };
});

jest.mock('utils', () => {
    return {
        isEnabledFeature: () => false,
    };
});

describe('clearUnusedVisualizationItems', () => {
    let visualization: any;

    beforeEach(() => {
        visualization = {
            id: 'MOCK_VISUALIZATION_ID',
            checkAllowedSort: () => true,
            checkAllowedDesignItems: () => true,
            checkAllowedShapes: () => true,
            availableLabelModes: ['percent'],
        };
        jest.mock('./../../../constants', () => {
            return {
                VISUALIZATION_IDS: {},
                CHART_SETTINGS: {},
            };
        });
    });

    afterEach(() => {
        jest.resetModules();
        jest.resetAllMocks();
    });

    it('Should return an empty array of shapes and an empty object with a config of shapes if the visualization does not support shapes', () => {
        visualization = {
            ...visualization,
            allowColors: true,
            allowSort: true,
            allowLabels: true,
            allowSegments: true,
            allowShapes: false,
        };

        const expectedResult: VisualizationFields = {
            colors: MOCKED_COLORS,
            colorsConfig: MOCKED_COLORS_CONFIG,
            sort: MOCKED_SORT,
            labels: MOCKED_LABELS,
            segments: MOCKED_SEGMENTS,
            shapes: [],
            shapesConfig: {},
        };

        const result = clearUnusedVisualizationItems({
            visualization,
            items: {
                colors: MOCKED_COLORS,
                colorsConfig: MOCKED_COLORS_CONFIG,
                sort: MOCKED_SORT,
                labels: MOCKED_LABELS,
                shapesConfig: MOCKED_SHAPES_CONFIG,
                shapes: MOCKED_SHAPES,
                segments: MOCKED_SEGMENTS,
            },
        });

        expect(result).toEqual(expectedResult);
    });

    it('Should return an empty array of colors and an empty object with a color config if the visualization does not support colors', () => {
        visualization = {
            ...visualization,
            id: 'column',
            allowColors: false,
            allowSort: true,
            allowLabels: true,
            allowSegments: true,
            allowShapes: true,
        };

        const expectedResult: VisualizationFields = {
            colors: [],
            colorsConfig: {},
            sort: MOCKED_SORT,
            labels: MOCKED_LABELS,
            shapes: MOCKED_SHAPES,
            segments: MOCKED_SEGMENTS,
            shapesConfig: MOCKED_SHAPES_CONFIG,
        };

        const result = clearUnusedVisualizationItems({
            visualization,
            items: {
                colors: MOCKED_COLORS,
                colorsConfig: MOCKED_COLORS_CONFIG,
                sort: MOCKED_SORT,
                labels: MOCKED_LABELS,
                shapesConfig: MOCKED_SHAPES_CONFIG,
                shapes: MOCKED_SHAPES,
                segments: MOCKED_SEGMENTS,
            },
        });

        expect(result).toEqual(expectedResult);
    });

    it('Should return an empty array of fields to sort if sorting is not supported by visualization', () => {
        visualization = {
            ...visualization,
            id: 'column',
            allowColors: true,
            allowSort: false,
            allowLabels: true,
            allowShapes: true,
            allowSegments: true,
        };

        const expectedResult: VisualizationFields = {
            colors: MOCKED_COLORS,
            colorsConfig: MOCKED_COLORS_CONFIG,
            sort: [],
            labels: MOCKED_LABELS,
            shapes: MOCKED_COLORS,
            shapesConfig: MOCKED_SHAPES_CONFIG,
            segments: MOCKED_SEGMENTS,
        };

        const result = clearUnusedVisualizationItems({
            visualization,
            items: {
                colors: MOCKED_COLORS,
                colorsConfig: MOCKED_COLORS_CONFIG,
                sort: MOCKED_SORT,
                labels: MOCKED_LABELS,
                shapesConfig: MOCKED_SHAPES_CONFIG,
                shapes: MOCKED_SHAPES,
                segments: MOCKED_SEGMENTS,
            },
        });

        expect(result).toEqual(expectedResult);
    });

    it('An empty array of labels should be returned if labels are not supported by visualization', () => {
        visualization = {
            ...visualization,
            allowColors: true,
            allowSort: true,
            allowLabels: false,
            allowShapes: true,
            allowSegments: true,
        };

        const expectedResult: VisualizationFields = {
            colors: MOCKED_COLORS,
            colorsConfig: MOCKED_COLORS_CONFIG,
            sort: MOCKED_SORT,
            labels: [],
            shapes: MOCKED_SHAPES,
            shapesConfig: MOCKED_SHAPES_CONFIG,
            segments: MOCKED_SEGMENTS,
        };

        const result = clearUnusedVisualizationItems({
            visualization,
            items: {
                colors: MOCKED_COLORS,
                colorsConfig: MOCKED_COLORS_CONFIG,
                sort: MOCKED_SORT,
                labels: MOCKED_LABELS,
                shapesConfig: MOCKED_SHAPES_CONFIG,
                shapes: MOCKED_SHAPES,
                segments: MOCKED_SEGMENTS,
            },
        });

        expect(result).toEqual(expectedResult);
    });

    it('An empty array of segments should be returned if segments are not supported by visualization', () => {
        visualization = {
            ...visualization,
            allowColors: true,
            allowSort: true,
            allowLabels: true,
            allowShapes: true,
            allowSegments: false,
        };

        const expectedResult: VisualizationFields = {
            colors: MOCKED_COLORS,
            colorsConfig: MOCKED_COLORS_CONFIG,
            sort: MOCKED_SORT,
            labels: MOCKED_LABELS,
            shapes: MOCKED_SHAPES,
            shapesConfig: MOCKED_SHAPES_CONFIG,
            segments: [],
        };

        const result = clearUnusedVisualizationItems({
            visualization,
            items: {
                colors: MOCKED_COLORS,
                colorsConfig: MOCKED_COLORS_CONFIG,
                sort: MOCKED_SORT,
                labels: MOCKED_LABELS,
                shapesConfig: MOCKED_SHAPES_CONFIG,
                shapes: MOCKED_SHAPES,
                segments: MOCKED_SEGMENTS,
            },
        });

        expect(result).toEqual(expectedResult);
    });

    it('Must keep sort even if the layer does not support when the chart is a combined chart', () => {
        visualization = {
            ...visualization,
            id: 'combined-chart',
            layers: [
                {
                    id: 'line',
                    checkAllowedSort: () => false,
                    checkAllowedDesignItems: () => true,
                    availableLabelModes: ['percent'],
                    allowColors: true,
                    commonPlaceholders: {
                        colors: [],
                        colorsConfig: {},
                        sort: MOCKED_SORT,
                        labels: [],
                        filters: [],
                    },
                    allowSort: false,
                    allowLabels: true,
                    layerSettings: {
                        id: 'line',
                    },
                },
            ],
        };

        const result = clearUnusedVisualizationItems({
            visualization,
            items: {
                colors: [],
                colorsConfig: {},
                sort: MOCKED_SORT,
                labels: [],
                shapesConfig: {},
                shapes: [],
                segments: [],
            },
        });

        expect(result.sort).toEqual(MOCKED_SORT);
        expect(visualization.layers[0].commonPlaceholders.sort).toEqual(MOCKED_SORT);
    });

    it.each([['pie'], ['donut']])(
        'Must filter colors if allowColors or visualization.id === %s',
        (id: string) => {
            visualization = {
                ...visualization,
                id,
                allowColors: false,
                allowSort: false,
                allowLabels: false,
                allowShapes: false,
                allowSegments: true,
            };
            const expectedResult: VisualizationFields = {
                colors: MOCKED_COLORS,
                colorsConfig: MOCKED_COLORS_CONFIG,
                sort: [],
                labels: [],
                shapes: [],
                shapesConfig: {},
                segments: [],
            };

            const result = clearUnusedVisualizationItems({
                visualization,
                items: {
                    colors: MOCKED_COLORS,
                    colorsConfig: MOCKED_COLORS_CONFIG,
                    sort: [],
                    labels: [],
                    shapesConfig: {},
                    shapes: [],
                    segments: [],
                },
            });

            expect(result).toEqual(expectedResult);
        },
    );

    it('commonPlaceholders must also be cleaned, for geolayer visualization', () => {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('./../../../constants', () => {
            return {
                VISUALIZATION_IDS: {GEOLAYER: 'geolayer'},
                CHART_SETTINGS: {},
            };
        });

        visualization.id = 'geolayer';
        visualization.selectedLayerId = 'geopoint';
        visualization.layers = [
            {
                id: 'geopoint',
                checkAllowedSort: () => false,
                checkAllowedDesignItems: () => true,
                availableLabelModes: ['percent'],
                allowColors: true,
                commonPlaceholders: {
                    colors: [],
                    colorsConfig: {},
                    sort: [],
                    labels: [],
                    shapesConfig: {},
                    shapes: [],
                },
                allowSort: false,
                allowLabels: true,
                layerSettings: {
                    id: 'geopoint',
                },
            },
            {
                id: 'polyline',
                checkAllowedSort: () => true,
                checkAllowedDesignItems: () => true,
                availableLabelModes: ['percent'],
                commonPlaceholders: {
                    colors: MOCKED_COLORS,
                    colorsConfig: MOCKED_COLORS_CONFIG,
                    sort: MOCKED_SORT,
                    labels: MOCKED_LABELS,
                    shapesConfig: MOCKED_SHAPES_CONFIG,
                    shapes: MOCKED_SHAPES,
                    segments: MOCKED_SEGMENTS,
                },
                allowColors: true,
                allowSort: true,
                allowLabels: true,
                layerSettings: {
                    id: 'polyline',
                },
            },
        ];

        const expectedResult: VisualizationFields = {
            colors: MOCKED_COLORS,
            colorsConfig: MOCKED_COLORS_CONFIG,
            sort: [],
            labels: MOCKED_LABELS,
            shapes: [],
            shapesConfig: {},
            segments: [],
        };

        const result = clearUnusedVisualizationItems({
            visualization,
            items: {
                colors: MOCKED_COLORS,
                colorsConfig: MOCKED_COLORS_CONFIG,
                sort: MOCKED_SORT,
                labels: MOCKED_LABELS,
                shapesConfig: {},
                shapes: MOCKED_SHAPES,
                segments: MOCKED_SEGMENTS,
            },
        });

        expect(result).toEqual(expectedResult);
    });

    it('Must delete segments if currentVisualization is a layer', () => {
        jest.resetModules();
        jest.resetAllMocks();
        jest.mock('./../../../constants', () => {
            return {
                VISUALIZATION_IDS: {COMBINED_CHART: 'combined-chart'},
                CHART_SETTINGS: {},
            };
        });

        visualization.id = 'combined-chart';
        visualization.selectedLayerId = 'line';
        visualization.layers = [
            {
                id: 'line',
                allowSegments: true,
                commonPlaceholders: {
                    colors: [],
                    colorsConfig: {},
                    sort: [],
                    labels: [],
                    shapesConfig: {},
                    shapes: [],
                },
                layerSettings: {
                    id: 'line',
                },
            },
        ];

        const result = clearUnusedVisualizationItems({
            visualization,
            items: {
                colors: [],
                colorsConfig: {},
                sort: [],
                labels: [],
                shapesConfig: {},
                shapes: [],
                segments: MOCKED_SEGMENTS,
            },
        });

        expect(result.segments).toEqual([]);
    });
});

describe('prepareCommonPlaceholderItems', () => {
    it.each([
        ['colors', {allowColors: false}],
        ['sort', {allowSort: false}],
        ['labels', {allowLabels: false}],
    ])(
        'Must remove %s from commonPlaceholders if this parameter is not supported in the layer',
        (type, setting) => {
            const layer = {
                id: 'geopoint',
                checkAllowedSort: () => true,
                checkAllowedDesignItems: () => true,
                availableLabelModes: ['percent'],
                allowColors: true,
                commonPlaceholders: {
                    colors: MOCKED_COLORS,
                    colorsConfig: MOCKED_COLORS_CONFIG,
                    sort: MOCKED_SORT,
                    labels: MOCKED_LABELS,
                    filters: [],
                },
                allowSort: true,
                allowLabels: true,
                layerSettings: {
                    id: 'geopoint',
                },
                ...setting,
            } as any;

            const expectedCommonPlaceholders = {
                colors: MOCKED_COLORS,
                colorsConfig: MOCKED_COLORS_CONFIG,
                sort: MOCKED_SORT,
                labels: MOCKED_LABELS,
                filters: [],
                segments: [],
                [type]: [],
                ...(type === 'colors' ? {colorsConfig: {}} : {}),
            };

            const result = prepareCommonPlaceholderItems(layer, {
                isLayer: true,
                isCombinedChart: false,
            });

            expect(result).toEqual(expectedCommonPlaceholders);
        },
    );
});
