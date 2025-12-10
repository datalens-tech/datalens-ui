import type {ServerField, ServerSort} from '../../../../../../../../../shared';
import type {PrepareFunctionDataRow} from '../../../types';

export interface GetSortedSegmentsList extends GetSegmentsList {
    sortItem: ServerSort | undefined;
}

export interface GetSegmentsList {
    data: PrepareFunctionDataRow[];
    segmentIndexInOrder: number;
    segmentField: ServerField | undefined;
}

export interface GetSegmentsMap {
    segments: string[];
    y2SectionItems: ServerField[];
}

export type SegmentsMap = Record<
    string,
    {
        title: string;
        index: number;
        isOpposite: boolean;
        plotIndex?: number;
    }
>;
