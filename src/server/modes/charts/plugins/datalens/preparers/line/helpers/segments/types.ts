import {DATASET_FIELD_TYPES, ServerField, ServerSort} from '../../../../../../../../../shared';
import {PrepareFunctionDataRow} from '../../../types';

export interface GetSortedSegmentsList extends GetSegmentsList {
    sortItem: ServerSort | undefined;
    idToDataType: Record<string, DATASET_FIELD_TYPES>;
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
    }
>;
