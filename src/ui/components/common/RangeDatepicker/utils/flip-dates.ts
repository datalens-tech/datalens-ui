import {dateTimeParse} from '@gravity-ui/date-utils';

import {isStartsLikeRelative} from '../../SimpleDatepicker/utils';
import {OUTPUT_FORMAT} from '../constants';

export const isNeededToFlipDates = (from?: string, to?: string) => {
    if (!from || !to) {
        return false;
    }

    const fromDate = dateTimeParse(from);
    const toDate = dateTimeParse(to);

    return Boolean(fromDate && toDate && fromDate > toDate);
};

export const getFlippedDates = (opts: {
    from: string;
    to: string;
    timeZone?: string;
    changed: 'from' | 'to';
}) => {
    const {from, to, timeZone, changed} = opts;
    let nextFrom = from;
    let nextTo = to;

    if (isStartsLikeRelative(to)) {
        nextFrom = to;
    } else if (changed === 'to') {
        const dateTimeFrom = dateTimeParse(from, {timeZone});
        nextFrom =
            dateTimeParse(to, {timeZone})
                ?.set('hours', dateTimeFrom?.hour())
                .set('minute', dateTimeFrom?.minute())
                .set('seconds', dateTimeFrom?.second())
                .format(OUTPUT_FORMAT) || '';
    }

    if (isStartsLikeRelative(from)) {
        nextTo = from;
    } else if (changed === 'from') {
        const dateTimeTo = dateTimeParse(to, {timeZone});
        nextTo =
            dateTimeParse(from, {timeZone})
                ?.set('hours', dateTimeTo?.hour())
                .set('minute', dateTimeTo?.minute())
                .set('seconds', dateTimeTo?.second())
                .format(OUTPUT_FORMAT) || '';
    }

    return {nextFrom, nextTo};
};
