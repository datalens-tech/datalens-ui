import type {ServerField} from '../../../../../../../../../shared';
import {findIndexInOrder} from '../../../../utils/misc-helpers';
import type {ResultDataOrder} from '../../../types';

export const getSegmentsIndexInOrder = (
    order: ResultDataOrder,
    segmentField: ServerField | undefined,
    idToTitle: Record<string, string>,
) => {
    if (!segmentField) {
        return -1;
    }

    const segmentTitle = idToTitle[segmentField.guid];

    return findIndexInOrder(order, segmentField, segmentTitle);
};
