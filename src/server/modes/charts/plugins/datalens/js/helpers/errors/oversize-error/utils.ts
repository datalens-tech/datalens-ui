import {MAX_SEGMENTS_NUMBER} from '../../../../../../../../../shared';
import {getSegmentsIndexInOrder, getSegmentsList} from '../../../../preparers/line/helpers';

import type {IsSegmentsOversizeError} from './types';

export const isDefaultOversizeError = (
    rowsLength: number | undefined,
    rowsLimit: number | undefined,
) => {
    return (
        typeof rowsLength !== 'undefined' &&
        typeof rowsLimit !== 'undefined' &&
        rowsLength > rowsLimit
    );
};

export const isBackendPivotCellsOversizeError = (
    cellsCount: number | undefined,
    cellsLimit: number | undefined,
) => {
    return (
        typeof cellsCount !== 'undefined' &&
        typeof cellsLimit !== 'undefined' &&
        cellsCount > cellsLimit
    );
};

export const isBackendPivotColumnsOversizeError = (
    columnsCount: number | undefined,
    columnsLimit: number | undefined,
) => {
    return (
        typeof columnsCount !== 'undefined' &&
        typeof columnsLimit !== 'undefined' &&
        columnsCount > columnsLimit
    );
};

export const isSegmentsOversizeError = (
    args: IsSegmentsOversizeError,
): {segmentsOversize: boolean; segmentsNumber: number} => {
    const {order, segments, idToTitle, data} = args;

    if (!segments.length) {
        return {
            segmentsOversize: false,
            segmentsNumber: 0,
        };
    }

    const segmentIndexInOrder = getSegmentsIndexInOrder(order, segments[0], idToTitle);

    const segmentsNames = getSegmentsList({data, segmentIndexInOrder, segmentField: segments[0]});

    return {
        segmentsOversize: segmentsNames.length > MAX_SEGMENTS_NUMBER,
        segmentsNumber: segmentsNames.length,
    };
};
