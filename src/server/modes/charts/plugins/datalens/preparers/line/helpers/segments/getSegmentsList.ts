import {SortDirection, isNumberField} from '../../../../../../../../../shared';
import {collator, numericStringCollator} from '../../../../utils/misc-helpers';

import {getSegmentName} from './getSegmentName';
import type {GetSegmentsList, GetSortedSegmentsList} from './types';

export const getSegmentsList = (args: GetSegmentsList): string[] => {
    const {data, segmentIndexInOrder, segmentField} = args;

    if (!segmentField) {
        return [];
    }

    const segmentsSet = new Set<string>([]);

    data.forEach((dataRow) => {
        const segmentName = getSegmentName(dataRow, segmentIndexInOrder);

        segmentsSet.add(segmentName);
    });

    return Array.from(segmentsSet);
};

export const getSortedSegmentsList = (args: GetSortedSegmentsList) => {
    const {data, segmentIndexInOrder, sortItem, segmentField} = args;

    if (!segmentField) {
        return [];
    }

    const segments = getSegmentsList({data, segmentField, segmentIndexInOrder});
    const sortFn = isNumberField(segmentField) ? numericStringCollator : collator.compare;
    segments.sort(sortFn);

    if (
        sortItem &&
        sortItem.guid === segmentField.guid &&
        sortItem.direction === SortDirection.ASC
    ) {
        segments.reverse();
    }

    return segments;
};
