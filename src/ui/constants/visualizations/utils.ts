import type {Field} from '../../../shared';
import {DatasetFieldAggregation, isFieldHierarchy} from '../../../shared';
import {ITEM_TYPES} from '../misc';

export const prepareFieldToDimensionTransformation = (item: Field): Field => {
    if (ITEM_TYPES.DIMENSIONS_AND_PSEUDO.has(item.type) || isFieldHierarchy(item)) {
        return item;
    }

    return {
        ...item,
        transformed: true,
        fakeTitle: item.fakeTitle || item.title,
        aggregation: DatasetFieldAggregation.None,
    };
};
