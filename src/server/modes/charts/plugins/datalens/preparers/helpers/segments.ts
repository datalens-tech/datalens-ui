import {PlaceholderId} from '../../../../../../../shared';
import {findIndexInOrder} from '../../utils/misc-helpers';
import {getSortedSegmentsList, getY2SegmentNameKey} from '../line/helpers';
import type {SegmentsMap} from '../line/helpers/segments/types';
import type {PrepareFunctionArgs} from '../types';

export function getSegmentMap(args: PrepareFunctionArgs): SegmentsMap {
    const {
        placeholders,
        resultData: {data, order},
        sort,
        segments,
        idToTitle,
    } = args;
    const segmentField = segments[0];

    if (!segmentField) {
        return {} as SegmentsMap;
    }

    const segmentFieldTitle = idToTitle[segmentField.guid];

    const segmentsList = getSortedSegmentsList({
        sortItem: sort?.[0],
        segmentField,
        segmentIndexInOrder: findIndexInOrder(order, segmentField, segmentFieldTitle),
        data,
    });

    const y2Fields = placeholders.find((p) => p.id === PlaceholderId.Y2)?.items || [];
    const hasOppositeYAxis = y2Fields.length > 0;

    return segmentsList.reduce((acc, segmentName) => {
        if (!acc[segmentName]) {
            const segmentIndex = Object.keys(acc).length;
            const title = segmentName;

            Object.assign(acc, {
                [segmentName]: {title, index: segmentIndex, isOpposite: false},
            });

            if (hasOppositeYAxis) {
                Object.assign(acc, {
                    [String(getY2SegmentNameKey(segmentName))]: {
                        title,
                        index: segmentIndex + 1,
                        isOpposite: true,
                    },
                });
            }
        }

        return acc;
    }, {} as SegmentsMap);
}
