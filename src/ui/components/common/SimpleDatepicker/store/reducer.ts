import {
    getCalendarConfigFromDate,
    getStringifiedDate,
    isCalendarConfigsEqual,
    isStartsLikeRelative,
} from '../utils';

import {Action, State} from './types';

export const getInitialState = (date?: string, timeZone?: string): State => ({
    active: false,
    touched: false,
    callOnUpdate: false,
    clearHovered: false,
    dateInput: '',
    timeInput: '',
    calendar: getCalendarConfigFromDate(),
    errors: [],
    valueType: isStartsLikeRelative(date) ? 'relative' : 'absolute',
    prevCalendar: undefined,
    lastOutput: getStringifiedDate(date, timeZone),
    doRestoreInput: false,
});

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case 'SET_ACTIVE': {
            const {active} = action.payload;
            return {...state, active, touched: true};
        }
        case 'SET_UPDATE': {
            const {callOnUpdate} = action.payload;
            return {...state, callOnUpdate};
        }
        case 'SET_CLEAR_HOVERED': {
            const {clearHovered} = action.payload;
            return {...state, clearHovered};
        }
        case 'SET_VALUE_TYPE': {
            const {valueType} = action.payload;
            return {...state, valueType};
        }
        case 'SET_CALENDAR': {
            const {month, year, mode, animation} = action.payload;

            const nextCalendar = {
                ...state.calendar,
                ...(Number.isInteger(month) && {month}),
                ...(year && {year}),
                ...(mode && {mode}),
                animation,
            };

            return {
                ...state,
                ...(!isCalendarConfigsEqual(nextCalendar, state.calendar) && {
                    prevCalendar: {...state.calendar, animation},
                }),
                calendar: {...nextCalendar},
            };
        }
        case 'SET_INPUTS': {
            const inputs = action.payload.entries.reduce((acc, [key, value]) => {
                acc[key] = value;
                return acc;
            }, {} as Record<string, string>);

            return {...state, ...inputs, doRestoreInput: false};
        }
        case 'SET_ERRORS': {
            const {errors, lastOutput} = action.payload;

            return {
                ...state,
                ...(lastOutput && {lastOutput}),
                errors,
            };
        }
        case 'SET_LAST_OUTPUT': {
            const {lastOutput} = action.payload;
            return {...state, lastOutput};
        }
        case 'ON_DATE_CLICK': {
            const updates: Partial<State> = {
                errors: [],
                valueType: 'absolute',
            };
            return {...state, ...updates};
        }
        case 'SET_RESTORE_INPUT': {
            const updates: Partial<State> = {
                doRestoreInput: true,
            };
            return {...state, ...updates};
        }
        default: {
            return state;
        }
    }
};
