import {OversizeErrorType} from '../../../constants/errors';

import type {GetOversizeErrorArgs} from './types';

export function getOversizeError({type, limit, current}: GetOversizeErrorArgs) {
    let code = '';
    let details: Record<string, number | string> = {};
    switch (type) {
        case OversizeErrorType.Default: {
            code = 'ERR.CHARTS.ROWS_NUMBER_OVERSIZE';
            details = {
                rowsLength: current,
                rowsLimit: limit,
            };
            break;
        }
        case OversizeErrorType.PivotTableCells: {
            code = 'ERR.CHARTS.TABLE_OVERSIZE';
            details = {
                type: 'cells',
                cellsCount: current,
                cellsLimit: limit,
            };
            break;
        }
        case OversizeErrorType.PivotTableColumns: {
            code = 'ERR.CHARTS.TABLE_OVERSIZE';
            details = {
                type: 'columns',
                columnsCount: current,
                columnsLimit: limit,
            };
            break;
        }
        case OversizeErrorType.SegmentsNumber: {
            code = 'ERR.CHARTS.SEGMENTS_OVERSIZE';
            details = {
                segmentsCount: current,
                segmentsLimit: limit,
            };
            break;
        }
    }

    return {
        code,
        details,
    };
}
