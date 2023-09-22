import {getAnnotations} from '../helpers';

import {ORDER_BY_MAP} from './mocks/common.mock';
import {
    BACKGROUND_COLORS,
    COLORS,
    DIMENSION_BACKGROUND_COLORS,
    MEASURE_NAME_COLORS,
    USED_FIELDS_MAP,
    extendUsedFieldsMap,
} from './mocks/getAnnotations.mock';

describe('getAnnotations', () => {
    it('Should turn colors into annotations and put them first in an array', () => {
        const result = getAnnotations({
            colors: COLORS,
            legendItemCounter: {legendItemIdIndex: 0},
            orderByMap: {},
            backgroundColors: BACKGROUND_COLORS,
            usedFieldsMap: USED_FIELDS_MAP,
        });

        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({
            legend_item_id: 0,
            block_id: 0,
            role_spec: {
                annotation_type: 'color',
                role: 'pivot_annotation',
                direction: 'asc',
            },
            ref: {type: 'id', id: '1899d37a-ff15-4bbc-b9f1-9df1e5f715ee'},
        });
    });

    it('Must put direction, depending on the value in order_by', () => {
        const result = getAnnotations({
            colors: COLORS,
            legendItemCounter: {legendItemIdIndex: 0},
            orderByMap: ORDER_BY_MAP,
            backgroundColors: [],
            usedFieldsMap: {},
        });

        expect(result[0].role_spec!.direction).toEqual('desc');
    });

    it('Must filter Measure Names', () => {
        const result = getAnnotations({
            orderByMap: {},
            colors: MEASURE_NAME_COLORS,
            legendItemCounter: {legendItemIdIndex: 0},
            backgroundColors: [],
            usedFieldsMap: {},
        });

        expect(result[0]).toBeUndefined();
    });

    it('Must increase legend_item_id by one for each field in turn: [colors, backgroundColors]', () => {
        const result = getAnnotations({
            colors: COLORS,
            legendItemCounter: {legendItemIdIndex: 0},
            orderByMap: {},
            backgroundColors: BACKGROUND_COLORS,
            usedFieldsMap: USED_FIELDS_MAP,
        });

        expect(result[0].legend_item_id).toEqual(0);
        expect(result[1].legend_item_id).toEqual(1);
    });

    it('Must add the legend_item_id from measuresReq to target_legend_item_ids if we request an annotation for the measure', () => {
        const result = getAnnotations({
            colors: [],
            legendItemCounter: {legendItemIdIndex: 0},
            orderByMap: {},
            backgroundColors: BACKGROUND_COLORS,
            usedFieldsMap: USED_FIELDS_MAP,
        });

        expect(result[0].role_spec!.target_legend_item_ids).toBeDefined();
        expect(result[0].role_spec!.target_legend_item_ids).toEqual([1]);
    });

    it('Should filter out dimensions that are not represented in the fields query for backgroundSettings annotation', () => {
        const result = getAnnotations({
            colors: [],
            legendItemCounter: {legendItemIdIndex: 0},
            orderByMap: {},
            backgroundColors: DIMENSION_BACKGROUND_COLORS,
            usedFieldsMap: USED_FIELDS_MAP,
        });
        expect(result).toHaveLength(0);
    });

    it('Must unlock the dimensions that are presented in the fields query for backgroundSettings annotation', () => {
        const result = getAnnotations({
            colors: [],
            legendItemCounter: {legendItemIdIndex: 0},
            orderByMap: {},
            backgroundColors: DIMENSION_BACKGROUND_COLORS,
            usedFieldsMap: extendUsedFieldsMap({
                'asdha91-2131njda-12424jjd-23s-21eh12h': {legendItemId: 2, role: 'pivot_column'},
            }),
        });

        expect(result).toHaveLength(1);
    });
});
