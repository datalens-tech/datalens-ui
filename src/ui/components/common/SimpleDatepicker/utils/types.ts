import type {DateTime} from '@gravity-ui/date-utils';

import type {State} from '../store';
import type {SimpleDatepickerProps} from '../types';

export enum FlipDirection {
    Back = -1,
    Forward = 1,
}

export type CalendarItem = {
    year: number;
    current?: boolean;
    selected?: boolean;
    disabled?: boolean;
};

export type DayItem = {
    day: number;
    month: number;
    weekend?: boolean;
    outOfBoundary?: boolean;
} & CalendarItem;

export type MonthItem = {
    month: number;
    title: string;
} & CalendarItem;

export type GetDataForCalendarArgs = {
    year: number;
    selectedDate?: DateTime;
    minDate?: DateTime;
    maxDate?: DateTime;
    timeZone?: string;
};

export type GetDataForMonthCalendarArgs = GetDataForCalendarArgs & {month: number};

export type ParseUserInput = (
    opt: {
        [key in
            | 'dateFormat'
            | 'timeFormat'
            | 'timeZone'
            | 'allowRelative'
            | 'setEndOfDayByDateClick'
            | 'withTime']: SimpleDatepickerProps[key];
    } & {
        [key in 'dateInput' | 'timeInput']: State[key];
    },
) => DateTime | undefined;
