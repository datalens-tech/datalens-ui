import {dateTime, dateTimeParse} from '@gravity-ui/date-utils';
import {I18n} from 'i18n';

import {SimpleDatepickerOutput} from '../../SimpleDatepicker';
import {getStringifiedDate, isStartsLikeRelative} from '../../SimpleDatepicker/utils';
import {OUTPUT_FORMAT} from '../constants';
import {State, StringifiedDateRange} from '../store';
import {RangeDatepickerOutput} from '../types';

const i18n = I18n.keyset('components.common.RangeDatepicker');
const ISO_DATE_LENGTH_WITHOUT_OFFSET = 23;

export const getErrorMessage = (errors: State['errors']) => {
    if (!errors.length) {
        return '';
    }

    if (errors.length > 1 && errors.includes('from') && errors.includes('to')) {
        return i18n('from_to_error');
    }

    if (errors.includes('incomplete-range')) {
        return i18n('incomplete_range_error');
    }

    return errors[0] === 'from' ? i18n('from_error') : i18n('to_error');
};

export const getStringifiedRange = (opt: {
    from?: string;
    to?: string;
    timeZone?: string;
}): StringifiedDateRange => {
    const {from, to, timeZone} = opt;

    return {
        timeZone,
        from: getStringifiedDate(from, timeZone) || from,
        to: getStringifiedDate(to, timeZone) || to,
    };
};

export const isStringifiedRangesEqual = (
    range1?: StringifiedDateRange,
    range2?: StringifiedDateRange,
) => {
    return (
        range1?.timeZone === range2?.timeZone &&
        range1?.from === range2?.from &&
        range1?.to === range2?.to
    );
};

export const getDateStringWithoutOffset = (ISODate: string | null) => {
    return ISODate?.slice(0, ISO_DATE_LENGTH_WITHOUT_OFFSET);
};

export const getTimeZoneOffset = (timeZone: string, withBrackets = true) => {
    const leftBracket = withBrackets ? '(' : '';
    const rightBracket = withBrackets ? ')' : '';

    return `${leftBracket}UTC${dateTime({timeZone}).format('Z')}${rightBracket}`;
};

export const getOutputData = (
    opt: {from?: string; to?: string; timeZone?: string} = {},
): RangeDatepickerOutput => {
    const {from, to, timeZone} = opt;
    let fromValue: string | null = null;
    let fromType: SimpleDatepickerOutput['type'] | null = null;
    let toValue: string | null = null;
    let toType: SimpleDatepickerOutput['type'] | null = null;

    if (from) {
        const startsLikeRelative = isStartsLikeRelative(from);
        fromValue = startsLikeRelative
            ? from
            : dateTimeParse(from, {timeZone})?.format(OUTPUT_FORMAT) || null;
        fromType = startsLikeRelative ? 'relative' : 'absolute';
    }

    if (to) {
        const startsLikeRelative = isStartsLikeRelative(to);
        toValue = startsLikeRelative
            ? to
            : dateTimeParse(to, {timeZone})?.format(OUTPUT_FORMAT) || null;
        toType = startsLikeRelative ? 'relative' : 'absolute';
    }

    return {
        from: {date: fromValue, type: fromType, timeZone},
        to: {date: toValue, type: toType, timeZone},
    };
};
