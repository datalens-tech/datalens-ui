import type {DateTime} from '@gravity-ui/date-utils';

import type {CalendarConfig, Dispatch} from '../../store';
import type {OnDateClick} from '../../types';

type Dates = {
    selectedDate?: DateTime;
    minDate?: DateTime;
    maxDate?: DateTime;
    timeZone?: string;
};

export type CalendarProps = Dates & {
    dispatch: Dispatch;
    onDateClick: OnDateClick;
    calendar: CalendarConfig;
    prevCalendar?: CalendarConfig;
};

export type MonthProps = Dates & {
    onDateClick: OnDateClick;
    month: number;
    year: number;
};

export type YearProps = Dates & {dispatch: Dispatch; year: number};

export type YearsProps = YearProps;
