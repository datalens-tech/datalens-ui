import type {GetSegmentsMap, SegmentsMap} from './types';

export const getY2SegmentNameKey = (segmentName: string | null | undefined) => {
    if (typeof segmentName !== 'string') {
        return segmentName;
    }
    return `${segmentName}__y2`;
};

export const getSegmentsMap = (args: GetSegmentsMap): SegmentsMap => {
    const {segments, y2SectionItems} = args;

    if (!segments.length) {
        return {};
    }

    const hasOppositeYAxis = Boolean(y2SectionItems.length);

    return segments.reduce((acc, segmentName) => {
        if (!acc[segmentName]) {
            const segmentIndex = Object.keys(acc).length;

            const updatedMap = {
                ...acc,
                [segmentName]: {title: segmentName, index: segmentIndex, isOpposite: false},
            };

            if (hasOppositeYAxis) {
                return {
                    ...updatedMap,
                    [getY2SegmentNameKey(segmentName) as string]: {
                        title: segmentName,
                        index: segmentIndex + 1,
                        isOpposite: true,
                    },
                };
            }

            return updatedMap;
        }

        return acc;
    }, {} as SegmentsMap);
};
