import {guessUserTimeZone} from '@gravity-ui/date-utils';

import {getStringifiedRange} from '../utils';

import {Action, State} from './types';

export const getInitialState = (from?: string, to?: string, timeZone?: string): State => ({
    active: false,
    touched: false,
    callOnUpdate: false,
    clearHovered: false,
    errors: [],
    selectedFrom: undefined,
    selectedTo: undefined,
    selectedTimeZone: timeZone,
    lastOutputRange: getStringifiedRange({from, to, timeZone}),
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
        case 'SET_ERRORS': {
            const {errors} = action.payload;
            return {...state, errors};
        }
        case 'SET_FROM': {
            const {selectedFrom, errors, callOnUpdate = false} = action.payload;
            return {
                ...state,
                ...(errors && {errors}),
                selectedFrom,
                callOnUpdate,
            };
        }
        case 'SET_TO': {
            const {selectedTo, errors, callOnUpdate = false} = action.payload;
            return {
                ...state,
                ...(errors && {errors}),
                selectedTo,
                callOnUpdate,
            };
        }
        case 'SET_FROM_TO': {
            const {selectedFrom, selectedTo, errors, callOnUpdate = false} = action.payload;
            return {
                ...state,
                ...(errors && {errors}),
                selectedFrom,
                selectedTo,
                callOnUpdate,
            };
        }
        case 'SET_TIMEZONE': {
            const {selectedTimeZone} = action.payload;
            return {...state, selectedTimeZone: selectedTimeZone || guessUserTimeZone()};
        }
        case 'SET_LAST_OUTPUT_RANGE': {
            const {lastOutputRange} = action.payload;
            return {...state, lastOutputRange};
        }
        default: {
            return state;
        }
    }
};
