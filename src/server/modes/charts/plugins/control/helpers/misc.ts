import {DAY} from '../constants/misc';

export function getISO(date: Date) {
    return date.toISOString();
}

export function getISOFromToday(daysOffset = 0) {
    return getISO(new Date(Date.now() - daysOffset * DAY));
}

type FormatRelativeRangeDatePayload = {from: number; to: number};

export function formatRelativeRangeDate(value: FormatRelativeRangeDatePayload) {
    const {from, to} = value;

    const fromDate = getISOFromToday(Number(from));
    const toDate = getISOFromToday(Number(to));

    return fromDate && toDate ? `__interval_${fromDate}_${toDate}` : '';
}

type FormatIntervalRangeDatePayload = {from: string; to: string};

export function formatIntervalRangeDate(value: FormatIntervalRangeDatePayload) {
    const {from, to} = value;

    const fromDate = from ? from : '0001-01-01';
    const toDate = to ? to : '9999-12-31';

    return fromDate && toDate ? `__interval_${fromDate}_${toDate}` : '';
}
