import type {PrepareFunctionDataRow} from '../../../types';

export const getSegmentName = (dataRow: PrepareFunctionDataRow, index: number): string => {
    const segmentName = dataRow[index];
    return segmentName === null ? 'Null' : segmentName;
};
