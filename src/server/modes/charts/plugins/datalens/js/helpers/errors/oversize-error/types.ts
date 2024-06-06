import type {ServerField} from '../../../../../../../../../shared';
import type {PrepareFunctionDataRow, ResultDataOrder} from '../../../../preparers/types';
import type {OversizeErrorType} from '../../../constants/errors';

export type GetOversizeErrorArgs = {
    type: OversizeErrorType;
    limit: number;
    current: number;
};

export type IsSegmentsOversizeError = {
    segments: ServerField[];
    order: ResultDataOrder;
    idToTitle: Record<string, string>;
    data: PrepareFunctionDataRow[];
};
