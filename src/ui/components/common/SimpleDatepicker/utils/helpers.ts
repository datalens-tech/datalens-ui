import {DateTime, dateTime, dateTimeParse, isValid} from '@gravity-ui/date-utils';
import {I18n} from 'i18n';
import _capitalize from 'lodash/capitalize';
import _range from 'lodash/range';
import {DL} from 'ui';

import {
    DEFAULT_DATE_FORMAT,
    DEFAULT_DATE_FORMATS,
    DEFAULT_RU_DATE_FORMAT,
    MAX_YEAR,
    MIN_YEAR,
    NATIVE_DATE_FORMAT,
    NATIVE_TIME_FORMAT,
    OUTPUT_FORMAT,
    UTC_TIMEZONE,
} from '../constants';
import type {CalendarConfig, InputValueType, State} from '../store';
import {SimpleDatepickerProps} from '../types';

import {FlipDirection, ParseUserInput} from './types';

const i18n = I18n.keyset('components.common.SimpleDatepicker');
const YEARS_LIST_LENGTH = 12;
const minAllowedDate = dateTime({input: {year: MIN_YEAR}});
const maxAllowedDate = dateTime({input: {year: MAX_YEAR}});

const getLang = () => DL.USER_LANG;

export const isDateInputFormatValid = (format: string, input: string) => {
    return dateTime({input, format}).isValid();
};

export const parseUserInput: ParseUserInput = (opt) => {
    const {
        dateInput,
        dateFormat,
        timeInput,
        timeFormat,
        timeZone,
        allowRelative,
        withTime,
        setEndOfDayByDateClick,
    } = opt;
    const time = withTime || (!withTime && setEndOfDayByDateClick && timeInput) ? timeInput : '';
    const inputDateFormat =
        dateFormat && isDateInputFormatValid(dateFormat, dateInput)
            ? dateFormat
            : getDefaultDateFormatByInputValue(dateInput);
    const input = `${dateInput} ${time && !dateInput.startsWith('now') ? time : ''}`.trim();
    const format = `${inputDateFormat} ${time ? timeFormat : ''}`.trim();
    let date = dateTimeParse(input, {format, timeZone: UTC_TIMEZONE, allowRelative});
    if (date && timeZone && timeZone !== UTC_TIMEZONE) {
        // set timezone to the parsed date from input.
        date = replaceTimeZone(date, timeZone);
    }

    if (/23:59/.test(time)) {
        date = date?.endOf('day');
    }

    if (date && (date < minAllowedDate || date > maxAllowedDate)) {
        date = undefined;
    }

    return date;
};

export const isStartsLikeRelative = (input = '') => input.startsWith('now');

export const isDatePropsValid = ({
    date,
    allowRelative,
}: {[key in 'date' | 'allowRelative']: SimpleDatepickerProps[key]}) => {
    const valid = isValid(date);
    const startsLikeRelative = isStartsLikeRelative(date);

    return startsLikeRelative ? allowRelative && valid : valid;
};

export const isTimeInputValid = (
    opt: {[key in 'dateFormat' | 'timeFormat' | 'withTime']: SimpleDatepickerProps[key]} & {
        [key in 'timeInput']: State[key];
    },
) => {
    const {dateFormat, timeInput, timeFormat, withTime} = opt;

    if (!withTime || !timeInput) {
        return true;
    }

    const dateValue = dateTime().format(dateFormat);
    const date = dateTime({
        input: `${dateValue} ${timeInput}`,
        format: `${dateFormat} ${timeFormat}`,
    });

    return date.isValid();
};

export const isCalendarConfigsEqual = (config1: CalendarConfig, config2?: CalendarConfig) => {
    if (!config2) {
        return false;
    }

    return (
        config1.month === config2.month &&
        config1.year === config2.year &&
        config1.mode === config2.mode
    );
};

export const getYearsRange = (currentYear: number) => {
    // This operation allows you to set the year that the user is working with, to the far left corner of the content.
    // Gets 9 years are left behind, and 2 years are ahead
    const start = currentYear - 9;
    return _range(start, start + YEARS_LIST_LENGTH);
};

export const getMonthTitle = (date: DateTime, format = 'MMM') => {
    const month = date.format(format);
    // In the Russian locale of moment, abbreviated names of months are indicated with a small letter and a dot at the end
    return getLang() === 'ru' ? _capitalize(month.replace('.', '')) : month;
};

export const getUserInputErrors = (
    opt: {[key in 'dateFormat' | 'timeFormat' | 'withTime']: SimpleDatepickerProps[key]} & {
        [key in 'dateInput' | 'timeInput']: State[key];
    },
) => {
    const {dateInput, dateFormat, timeInput, timeFormat, withTime} = opt;
    const errors: InputValueType[] = [];
    const date = dateTime({input: dateInput, format: dateFormat});

    if (!date.isValid()) {
        errors.push('date');
    }

    if (!isTimeInputValid({dateFormat, timeFormat, timeInput, withTime})) {
        errors.push('time');
    }

    return errors;
};

export const getCalendarConfigFromDate = (date?: DateTime): CalendarConfig => {
    const resultDate = date || dateTime();

    return {
        month: resultDate.month(),
        year: resultDate.year(),
        mode: 'month',
    };
};

export const getSwitcherTitle = ({month, year, mode}: CalendarConfig) => {
    const date = dateTime({input: {month, year}}).locale(getLang());

    switch (mode) {
        case 'month': {
            return `${getMonthTitle(date, 'MMMM')} ${date.year()}`;
        }
        case 'year': {
            return String(date.year());
        }
        case 'years':
        default: {
            const range = getYearsRange(year);
            return `${range[0]} — ${range.slice(-1)}`;
        }
    }
};

export const getUpdatedCalendarConfigByFlip = (
    config: CalendarConfig,
    direction: FlipDirection,
) => {
    const {month, year, mode} = config;
    const animation: CalendarConfig['animation'] =
        direction === FlipDirection.Back ? 'forward' : 'back';
    let date = dateTime({input: {month, year}});

    switch (mode) {
        case 'month':
            date = date.add({month: 1 * Number(direction)});
            break;
        case 'year':
            date = date.add({year: 1 * Number(direction)});
            break;
        case 'years':
            date = date.add({year: 12 * Number(direction)});
    }

    return {
        animation,
        mode,
        month: date.month(),
        year: date.year(),
    };
};

export const getTimePlaceholder = (timeFormat: SimpleDatepickerProps['timeFormat']) => {
    return timeFormat === 'HH:mm:ss' ? i18n('time_with_sec_placeholder') : i18n('time_placeholder');
};

export const getDefaultDateFormat = () => {
    return getLang() === 'ru' ? DEFAULT_RU_DATE_FORMAT : DEFAULT_DATE_FORMAT;
};

export const getDefaultDatePlaceholder = () => {
    return getLang() === 'ru'
        ? i18n('default_ru_date_placeholder')
        : i18n('default_date_placeholder');
};

export const getErrorMessage = ({
    errors,
    dateFormat,
    timeFormat,
    relative = false,
}: {
    errors: InputValueType[];
    dateFormat: string;
    timeFormat: SimpleDatepickerProps['timeFormat'];
    relative: boolean;
}) => {
    if (!errors.length) {
        return '';
    }

    if (relative) {
        return i18n('relative_input_error', {format: dateFormat});
    }

    if (errors.length === 2) {
        return i18n('date_and_time_input_error', {format: `${dateFormat} ${timeFormat}`});
    }

    return errors[0] === 'time'
        ? i18n('time_input_error', {format: timeFormat})
        : i18n('date_input_error', {format: dateFormat});
};

export const getStringifiedDate = (input?: string, timeZone?: string) => {
    if (isStartsLikeRelative(input)) {
        return input;
    }

    const parsedDate = dateTimeParse(input, {timeZone})?.format(OUTPUT_FORMAT);

    return input && !parsedDate ? input : parsedDate;
};

export const clampDate = ({
    date,
    minDate,
    maxDate,
}: {
    date?: DateTime;
    minDate?: DateTime;
    maxDate?: DateTime;
}) => {
    let resultDate = date;
    let clamped = false;

    if (resultDate && minDate && resultDate < minDate) {
        resultDate = minDate;
        clamped = true;
    }

    if (resultDate && maxDate && resultDate > maxDate) {
        resultDate = maxDate;
        clamped = true;
    }

    return {resultDate, clamped};
};

export const getFormattedDate = (input?: DateTime | string, format = DEFAULT_DATE_FORMAT) => {
    if (!input) {
        return '';
    }

    const date = typeof input === 'string' ? dateTime({input}) : input;

    return date.format(format);
};

export const getValueForNativeInput = (opt: {
    type: InputValueType;
    date?: string;
    format?: string;
}) => {
    const {type, date, format} = opt;
    const resultFormat = type === 'time' ? NATIVE_TIME_FORMAT : NATIVE_DATE_FORMAT;

    return dateTimeParse(date, {format})?.format(resultFormat);
};

export function replaceTimeZone(date: DateTime, timeZone: string) {
    // @ts-expect-error
    return dateTime({timeZone}).set({
        year: date.year(),
        month: date.month(),
        date: date.date(),
        hour: date.hour(),
        minute: date.minute(),
        second: date.second(),
    });
}

export function getDefaultDateFormatByInputValue(inputValue: string) {
    for (let i = 0; i < DEFAULT_DATE_FORMATS.length; i++) {
        if (isDateInputFormatValid(DEFAULT_DATE_FORMATS[i], inputValue)) {
            return DEFAULT_DATE_FORMATS[i];
        }
    }

    return getDefaultDateFormat();
}
