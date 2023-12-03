import {DateTime} from 'luxon';

import {QLParamInterval, QLParamType, resolveRelativeDate} from '../../../../../../../shared';
import {LUXON_FORMATS} from '../../../../../../components/RelativeDatesPicker/constants';

export const resolveAndFormatDate = (date: string, type: QLParamType) => {
    const resolvedDate = resolveRelativeDate(date);

    return DateTime.fromISO(resolvedDate || date, {
        zone: 'utc',
    }).toFormat(type === QLParamType.Datetime ? LUXON_FORMATS.DATE_TIME : LUXON_FORMATS.DATE);
};

type ValidIntervalValue = {
    from: string;
    to: string;
};

export const valueIsValidIntervalValue = (
    value: string | string[] | QLParamInterval | undefined,
): value is ValidIntervalValue => {
    return Boolean(typeof value === 'object' && !Array.isArray(value) && value.from && value.to);
};
