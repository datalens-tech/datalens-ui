import {omit} from 'lodash';

import type {StringParams} from '../../../types';

export const extractTypedQueryParams = (
    params: StringParams | undefined,
    fieldName: string | undefined,
): StringParams => {
    return omit(params ?? {}, fieldName ?? '');
};
