import {dateTimeUtc} from '@gravity-ui/date-utils';
import {QLParamType, resolveRelativeDate} from 'shared';
import type {QLParamInterval} from 'shared';
import {getDefaultDateFormat} from 'ui/utils';

export const resolveAndFormatDate = (date: string, type: QLParamType) => {
    const input = resolveRelativeDate(date) || date;
    const format = getDefaultDateFormat({withTime: type === QLParamType.Datetime});

    return dateTimeUtc({input}).format(format);
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
