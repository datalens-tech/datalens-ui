import type {Field, Placeholder, Shared, Update} from 'shared';

import {actualizeUpdates, checkAllowedAreaSort} from '../helpers';

jest.mock('utils', () => {
    return {
        isEnabledFeature: () => false,
    };
});

describe('checkAllowedAreaSort', () => {
    const MOCKED_VISUALIZATION_WITHOUT_ITEMS = {
        placeholders: [
            {
                items: [],
            },
        ],
    } as unknown as Shared['visualization'];

    const MOCKED_VISUALIZATION_WITH_ITEMS = {
        placeholders: [
            {
                items: [
                    {
                        guid: 'first_item',
                    },
                    {
                        guid: 'second_item',
                    },
                    {
                        guid: 'third_item',
                    },
                ],
            },
        ],
    } as unknown as Shared['visualization'];

    const MEASURE_ITEM = {
        type: 'MEASURE',
    } as Field;

    const DIMENSION_ITEM = {
        type: 'DIMENSION',
        guid: 'first_item',
    } as Field;

    const DIMENSION_ITEM_2 = {
        type: 'DIMENSION',
        guid: 'third_item',
    } as Field;

    const NOT_SELECTED_DIMENSION_ITEM = {
        type: 'DIMENSION',
        guid: 'not_selected',
    } as Field;

    const DIMENSIONS_ITEMS: Field[] = [
        DIMENSION_ITEM,
        DIMENSION_ITEM_2,
        NOT_SELECTED_DIMENSION_ITEM,
    ];

    const COLOR_ITEM = {
        type: 'DIMENSION',
        guid: 'color_item',
    } as Field;

    it('For a field with the MEASURE type, true is always returned', () => {
        const expectedResult = true;
        const result = checkAllowedAreaSort(
            MEASURE_ITEM,
            MOCKED_VISUALIZATION_WITHOUT_ITEMS,
            [],
            [],
        );

        expect(result).toEqual(expectedResult);
    });

    it('Should return true for a field with the DIMENSION type if it is added to standard visualization sections', () => {
        const expectedResult = [true, true, false];

        const result = DIMENSIONS_ITEMS.map((item) =>
            checkAllowedAreaSort(item, MOCKED_VISUALIZATION_WITH_ITEMS, [], []),
        );

        expect(result).toEqual(expectedResult);
    });

    it('Should return true if the field is added to the Color section', () => {
        const expectedResult = [false, false, false, true];

        const MEASURE_ITEMS_WITH_COLOR = [...DIMENSIONS_ITEMS, COLOR_ITEM];

        const result = MEASURE_ITEMS_WITH_COLOR.map((item) =>
            checkAllowedAreaSort(item, MOCKED_VISUALIZATION_WITHOUT_ITEMS, [COLOR_ITEM], []),
        );

        expect(result).toEqual(expectedResult);
    });
});

describe('actualizeUpdates', () => {
    const MOCKED_PLACEHOLDERS = [
        {items: [{guid: '1'}, {guid: '2'}]},
        {items: [{guid: '3'}]},
    ] as Placeholder[];
    const MOCKED_VISUALIZATION = {
        id: 'column',
        placeholders: MOCKED_PLACEHOLDERS,
    } as Shared['visualization'];
    const MOCKED_SORT_FIELD = {guid: '2', quickFormula: true} as Field;
    const MOCKED_COLOR_FIELD = {guid: '3'} as Field;

    const MOCKED_SECTION_DATASET_FIELDS = [
        {guid: '1', quickFormula: true},
        {guid: '2', quickFormula: true},
        {guid: '3'},
        {guid: '4'},
        {guid: '5', quickFormula: true},
    ] as Field[];
    it('Should return the attributes for the fields that are in visualization.placeholders.items', () => {
        const updates = [
            {field: {guid: '1'}},
            {field: {guid: '3'}},
            {field: {guid: '5'}},
        ] as Update[];

        const expectedResult = [{field: {guid: '1'}}, {field: {guid: '3'}}];

        const result = actualizeUpdates({
            updates,
            visualization: MOCKED_VISUALIZATION,
            sectionDatasetFields: [],
            visualizationFields: [],
        });

        expect(result).toEqual(expectedResult);
    });

    it('Should return updates for fields that are in the dataset section and visible to the user', () => {
        const updates = [
            {field: {guid: '1', quickFormula: true}},
            {field: {guid: '2', quickFormula: true}},
            {field: {guid: '3'}},
            {field: {guid: '4'}},
            {field: {guid: '5', quickFormula: true}},
        ] as Update[];

        const expectedResult = [{field: {guid: '3'}}, {field: {guid: '4'}}];

        const result = actualizeUpdates({
            updates,
            visualization: {id: 'column', placeholders: []} as unknown as Shared['visualization'],
            sectionDatasetFields: MOCKED_SECTION_DATASET_FIELDS,
            visualizationFields: [],
        });

        expect(result).toEqual(expectedResult);
    });

    it('Must return the passed updates if visualization === undefined', () => {
        const updates = [
            {field: {guid: '1', quickFormula: true}},
            {field: {guid: '3'}},
            {field: {guid: '4'}},
        ] as Update[];

        const expectedResult = [...updates];

        const result = actualizeUpdates({
            updates,
            visualization: undefined,
            sectionDatasetFields: [],
            visualizationFields: [],
        });

        expect(result).toEqual(expectedResult);
    });

    it('Must return all updates for fields that are listed in onUpdateItemsGuids', () => {
        const updates = [
            {field: {guid: '7', quickFormula: true}},
            {field: {guid: '3'}},
            {field: {guid: '4'}},
        ] as Update[];

        const expectedResult = [{field: {guid: '7', quickFormula: true}}, {field: {guid: '4'}}];

        const MOCKED_ON_UPDATES_ITEMS_GUIDS = [{guid: '4'}, {guid: '7'}];

        const result = actualizeUpdates({
            updates,
            visualization: {id: 'column'} as Shared['visualization'],
            sectionDatasetFields: [],
            onUpdateItemsGuids: MOCKED_ON_UPDATES_ITEMS_GUIDS,
            visualizationFields: [],
        });

        expect(result).toEqual(expectedResult);
    });

    it('Must return all updates for fields that are not in the main visualization placeholders', () => {
        const updates = [
            {field: {guid: '2', quickFormula: true}},
            {field: {guid: '3'}},
            {field: {guid: '4'}},
        ] as Update[];

        const expectedResult = [{field: {guid: '2', quickFormula: true}}, {field: {guid: '3'}}];

        const result = actualizeUpdates({
            updates,
            visualization: {id: 'column'} as Shared['visualization'],
            sectionDatasetFields: [],
            onUpdateItemsGuids: [],
            visualizationFields: [MOCKED_COLOR_FIELD, MOCKED_SORT_FIELD],
        });

        expect(result).toEqual(expectedResult);
    });
});
