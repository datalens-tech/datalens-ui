import React from 'react';

import type {SimpleDatepickerOutput} from '../types';

export type Dispatch = React.Dispatch<Action>;

export type State = {
    active: boolean;
    touched: boolean;
    callOnUpdate: boolean;
    clearHovered: boolean;
    dateInput: string;
    timeInput: string;
    calendar: CalendarConfig;
    errors: InputValueType[];
    valueType: SimpleDatepickerOutput['type'];
    prevCalendar?: CalendarConfig;
    lastOutput?: string;
    doRestoreInput: boolean;
};

export type CalendarConfig = {
    month: number;
    year: number;
    mode: 'month' | 'year' | 'years';
    animation?: 'back' | 'forward' | 'zoom-in' | 'zoom-out';
};

export type InputValueType = 'date' | 'time';

type SetActive = {type: 'SET_ACTIVE'; payload: {active: boolean}};
type SetUpdate = {type: 'SET_UPDATE'; payload: {callOnUpdate: boolean}};
type SetClearHovered = {type: 'SET_CLEAR_HOVERED'; payload: {clearHovered: boolean}};
type SetType = {type: 'SET_VALUE_TYPE'; payload: {valueType: State['valueType']}};
type SetInputs = {type: 'SET_INPUTS'; payload: {entries: [string, string][]}};
type SetErrors = {
    type: 'SET_ERRORS';
    payload: {errors: InputValueType[]; lastOutput?: string};
};
type SetCalendar = {
    type: 'SET_CALENDAR';
    payload: Partial<CalendarConfig>;
};
type SetLastOutput = {
    type: 'SET_LAST_OUTPUT';
    payload: {lastOutput?: string};
};
type OnDateClick = {type: 'ON_DATE_CLICK'};
type SetRestoreInput = {type: 'SET_RESTORE_INPUT'};

export type Action =
    | SetActive
    | SetUpdate
    | SetClearHovered
    | SetType
    | SetCalendar
    | SetInputs
    | SetErrors
    | SetLastOutput
    | OnDateClick
    | SetRestoreInput;
