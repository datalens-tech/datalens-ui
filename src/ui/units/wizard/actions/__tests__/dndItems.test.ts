import type {ClientChartsConfig, VisualizationWithLayersShared} from 'shared';
import {PlaceholderId} from 'shared';

import {getFieldsFromVisualization} from '../dndItems';

describe('getFieldsFromVisualization', () => {
    it('should extract fields from placeholder in visualization', () => {
        const visualization = {
            id: 'line',
            placeholders: [
                {
                    id: 'x',
                    items: [{guid: 'field-1'}],
                },
            ],
        } as ClientChartsConfig['visualization'];
        const result = getFieldsFromVisualization(visualization, PlaceholderId.X);

        expect(result).toEqual([{guid: 'field-1'}]);
    });

    it('should extract fields from current layer placeholder in visualization with layers', () => {
        const visualizationWithLayers = {
            id: 'combined-chart',
            layers: [
                {
                    id: 'line',
                    placeholders: [
                        {
                            id: 'y',
                            items: [{guid: 'field-1'}],
                        },
                    ],
                    layerSettings: {id: 'first-layer-id'},
                },
                {
                    id: 'columns',
                    placeholders: [
                        {
                            id: 'y',
                            items: [{guid: 'field-2'}, {guid: 'field-3'}],
                        },
                    ],
                    layerSettings: {id: 'second-layer-id'},
                },
            ],
            selectedLayerId: 'second-layer-id',
        } as VisualizationWithLayersShared['visualization'];

        const result = getFieldsFromVisualization(visualizationWithLayers, PlaceholderId.Y);

        expect(result).toEqual([{guid: 'field-2'}, {guid: 'field-3'}]);
    });

    it('should return empty array when visualization is undefined', () => {
        const result = getFieldsFromVisualization(undefined, PlaceholderId.X);

        expect(result).toEqual([]);
    });

    it('should return empty array when placeholderId is undefined', () => {
        const visualization = {
            id: 'line',
            placeholders: [
                {
                    id: 'x',
                    items: [{guid: 'field-1'}],
                },
            ],
        } as ClientChartsConfig['visualization'];
        const result = getFieldsFromVisualization(visualization, undefined);

        expect(result).toEqual([]);
    });

    it("should return empty array when visualization doesn't have placeholderId", () => {
        const visualization = {
            id: 'line',
            placeholders: [
                {
                    id: 'x',
                    items: [{guid: 'field-1'}],
                },
            ],
        } as ClientChartsConfig['visualization'];

        const result = getFieldsFromVisualization(visualization, PlaceholderId.Y);

        expect(result).toEqual([]);
    });
});
