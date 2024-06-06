import type {Field, HierarchyField, VisualizationWithLayersShared} from 'shared';

import {updateColorsHierarchies} from '../updateColorHierarchies';

const getMockedVisualization = ([colors1, colors2]: Field[][]) => {
    return {
        id: 'combined-chart',
        layers: [
            {
                commonPlaceholders: {
                    colors: colors1 || [],
                },
            },
            {
                commonPlaceholders: {
                    colors: colors2 || [],
                },
            },
        ],
    } as unknown as VisualizationWithLayersShared['visualization'];
};

describe('updateColorHierarchies', () => {
    const MOCKED_HIERARCHY_1 = {
        guid: 'ebf37130-9d83-11ed-a9d3-516d174b6a16',
        title: 'New hierarchy',
        className: 'item dimension-item',
        type: 'PSEUDO',
        data_type: 'hierarchy',
        valid: true,
        fields: [
            {
                guid: 'ac8dd226-3372-4212-bde7-17afc792a728',
                title: 'Category',
            },
            {
                guid: '31a68190-2d88-11eb-afa6-49f9724aeea2',
                title: 'customcat',
            },
            {
                guid: '8e3de63c-3adb-4479-a0b4-5e4321e2ec94',
                title: 'Customer ID',
            },
        ],
    } as HierarchyField;
    const MOCKED_HIERARCHY_2 = {
        guid: 'ebf37130-9d83-11ed-a9d3-516d174b6a16',
        title: 'New hierarchy',
        className: 'item dimension-item',
        type: 'PSEUDO',
        data_type: 'hierarchy',
        valid: true,
        fields: [
            {
                guid: 'e6115038-dc12-41c1-beae-2f7e84d33bc2',
                title: 'Region',
            },
            {
                guid: 'b2fb6ed8-8ec8-4a6b-9034-ffb081fd1de2',
                title: 'Segment',
            },
        ],
    } as HierarchyField;
    const MOCKED_DIMENSION_FIELD = {
        guid: 'ac8dd226-3372-4212-bde7-17afc792a728',
        title: 'Category',
    } as Field;

    it('Should update only hierarchies', () => {
        const result = updateColorsHierarchies(
            [MOCKED_DIMENSION_FIELD, MOCKED_HIERARCHY_1],
            [MOCKED_HIERARCHY_2],
            getMockedVisualization([]),
        );

        expect(result.colors).toEqual([MOCKED_DIMENSION_FIELD, MOCKED_HIERARCHY_2]);
    });

    it('Should update commonPlaceholders where field exists', () => {
        const result = updateColorsHierarchies(
            [MOCKED_DIMENSION_FIELD, MOCKED_HIERARCHY_1],
            [MOCKED_HIERARCHY_2],
            getMockedVisualization([[MOCKED_HIERARCHY_1]]),
        );

        const resultVisualization =
            result.visualization as VisualizationWithLayersShared['visualization'];

        expect(resultVisualization.layers[0].commonPlaceholders.colors).toEqual([
            MOCKED_HIERARCHY_2,
        ]);
        expect(resultVisualization.layers[1].commonPlaceholders.colors).toEqual([]);
    });

    it('Should update same field for all layers', () => {
        const result = updateColorsHierarchies(
            [MOCKED_HIERARCHY_1],
            [MOCKED_HIERARCHY_2],
            getMockedVisualization([[MOCKED_HIERARCHY_1], [MOCKED_HIERARCHY_1]]),
        );

        const resultVisualization =
            result.visualization as VisualizationWithLayersShared['visualization'];

        expect(resultVisualization.layers[0].commonPlaceholders.colors).toEqual([
            MOCKED_HIERARCHY_2,
        ]);
        expect(resultVisualization.layers[1].commonPlaceholders.colors).toEqual([
            MOCKED_HIERARCHY_2,
        ]);
    });
});
