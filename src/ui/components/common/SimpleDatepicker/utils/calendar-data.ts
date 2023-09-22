import {DateTime, DateTimeInput, dateTimeParse} from '@gravity-ui/date-utils';
import _cloneDeep from 'lodash/cloneDeep';
import _range from 'lodash/range';
import {DL} from 'ui';

import {UTC_TIMEZONE} from '../constants';

import {getMonthTitle, getYearsRange, replaceTimeZone} from './helpers';
import {
    CalendarItem,
    DayItem,
    GetDataForCalendarArgs,
    GetDataForMonthCalendarArgs,
    MonthItem,
} from './types';

const WEEK_LENGTH = 7;
const CALENDAR_CELLS_COUNT = 42;
const DAY_INDEXES = [..._range(1, WEEK_LENGTH), 0]; // Sunday - 0, Monday - 1
const MONTH_INDEXES = _range(0, 12);
const WEEKENDS = DAY_INDEXES.slice(-2);

const isCalendarItemDisabled = (data: {
    unit: 'day' | 'month' | 'year';
    date: DateTime;
    minDate?: DateTime;
    maxDate?: DateTime;
}) => {
    const {unit, date, minDate, maxDate} = data;

    return Boolean(
        (minDate && date.endOf(unit) < minDate) || (maxDate && date.startOf(unit) > maxDate),
    );
};

const getDateTime = (validInput: DateTimeInput, timeZone?: string) => {
    if (typeof validInput === 'object') {
        let date = dateTimeParse(validInput, {timeZone: UTC_TIMEZONE}) as DateTime;
        if (timeZone && timeZone !== UTC_TIMEZONE) {
            date = replaceTimeZone(date, timeZone);
        }
        return date;
    }
    return dateTimeParse(validInput, {timeZone}) as DateTime;
};

const getNextDayIndex = (index: number, amount = 1) => (index + amount) % WEEK_LENGTH;

const getDateParts = (date: DateTime) => ({
    day: date.date(),
    month: date.month(),
    year: date.year(),
});

const getDayItems = (data: {
    days: number[];
    month: number;
    year: number;
    startDayIndex: number;
    timeZone?: string;
    outOfBoundary?: boolean;
    selectedDate?: DateTime;
    minDate?: DateTime;
    maxDate?: DateTime;
}) => {
    const {
        days,
        month,
        year,
        startDayIndex,
        timeZone,
        outOfBoundary,
        selectedDate,
        minDate,
        maxDate,
    } = data;
    const {
        day: currentDay,
        month: currentMonth,
        year: currentYear,
    } = getDateParts(getDateTime('now', timeZone));

    let selectedDay: number | undefined;
    let selectedMonth: number | undefined;
    let selectedYear: number | undefined;

    if (selectedDate) {
        ({day: selectedDay, month: selectedMonth, year: selectedYear} = getDateParts(selectedDate));
    }

    let dayIndex = startDayIndex;

    return days.map((day): DayItem => {
        const date = getDateTime({day, month, year}, timeZone);
        const disabled = isCalendarItemDisabled({unit: 'day', date, minDate, maxDate});

        let current = false;
        let selected = false;
        let weekend = false;

        if (!outOfBoundary) {
            current = day === currentDay && month === currentMonth && year === currentYear;
            selected = day === selectedDay && month === selectedMonth && year === selectedYear;
            weekend = WEEKENDS.includes(dayIndex);
        }

        dayIndex = getNextDayIndex(dayIndex);

        return {
            day,
            month,
            year,
            current,
            selected,
            weekend,
            disabled,
            outOfBoundary,
        };
    });
};

export const getDataForMonthCalendar = ({
    month,
    year,
    timeZone,
    selectedDate,
    minDate,
    maxDate,
}: GetDataForMonthCalendarArgs) => {
    const startDate = getDateTime({month, year}, timeZone);
    const startWeekday = startDate.day();
    const daysInMonth = startDate.daysInMonth();
    const prevMonthLastDate = _cloneDeep(startDate).add({day: -1});
    const prevMonthDaysCount = DAY_INDEXES.slice(0, DAY_INDEXES.indexOf(startWeekday)).length;
    // adding 1 to get the correct interval, including the last date
    const daysInPrevMonth = prevMonthLastDate.daysInMonth() + 1;
    const nextMonthFirstDate = _cloneDeep(startDate).endOf('month').add({day: 1});
    let nextMonthDaysCount = DAY_INDEXES.slice(nextMonthFirstDate.day() - 1).length;

    if (daysInMonth + prevMonthDaysCount + nextMonthDaysCount < CALENDAR_CELLS_COUNT) {
        nextMonthDaysCount += WEEK_LENGTH;
    }

    let dayIndex = 1;

    const prevMonthDays = _range(daysInPrevMonth - prevMonthDaysCount, daysInPrevMonth);
    const prevMonthDayItems = getDayItems({
        timeZone,
        selectedDate,
        minDate,
        maxDate,
        days: prevMonthDays,
        month: prevMonthLastDate.month(),
        year: prevMonthLastDate.year(),
        startDayIndex: dayIndex,
        outOfBoundary: true,
    });

    dayIndex = getNextDayIndex(dayIndex, prevMonthDays.length);

    const currentMonthDays = _range(1, daysInMonth + 1);
    const currentMonthDayItems = getDayItems({
        timeZone,
        selectedDate,
        minDate,
        maxDate,
        month,
        year,
        days: currentMonthDays,
        startDayIndex: dayIndex,
    });

    dayIndex = getNextDayIndex(dayIndex, currentMonthDays.length);

    const nextMonthDays = _range(1, nextMonthDaysCount + 1);
    const nextMonthDayItems = getDayItems({
        timeZone,
        selectedDate,
        minDate,
        maxDate,
        days: nextMonthDays,
        month: nextMonthFirstDate.month(),
        year: nextMonthFirstDate.year(),
        startDayIndex: dayIndex,
        outOfBoundary: true,
    });

    return prevMonthDayItems.concat(currentMonthDayItems, nextMonthDayItems);
};

export const getDataForYearCalendar = ({
    year,
    timeZone,
    selectedDate,
    minDate,
    maxDate,
}: GetDataForCalendarArgs) => {
    const now = getDateTime('now', timeZone);

    return MONTH_INDEXES.map((month): MonthItem => {
        const date = getDateTime({month, year}, timeZone).locale(DL.USER_LANG);

        return {
            month,
            year,
            title: getMonthTitle(date),
            current: month === now.month() && year === now.year(),
            selected: month === selectedDate?.month() && year === selectedDate.year(),
            disabled: isCalendarItemDisabled({unit: 'month', date, minDate, maxDate}),
        };
    });
};

export const getDataForYearsCalendar = ({
    year,
    timeZone,
    selectedDate,
    minDate,
    maxDate,
}: GetDataForCalendarArgs) => {
    const now = getDateTime('now', timeZone);

    return getYearsRange(year).map((renderedYear): CalendarItem => {
        const date = getDateTime({year: renderedYear}, timeZone);

        return {
            year: renderedYear,
            current: renderedYear === now.year(),
            selected: renderedYear === selectedDate?.year(),
            disabled: isCalendarItemDisabled({unit: 'year', date, minDate, maxDate}),
        };
    });
};
