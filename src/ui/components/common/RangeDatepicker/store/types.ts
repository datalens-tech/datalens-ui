import React from 'react';

export type State = {
    active: boolean;
    touched: boolean;
    callOnUpdate: boolean;
    clearHovered: boolean;
    errors: ('from' | 'to' | 'incomplete-range')[];
    selectedTimeZone?: string;
    selectedFrom?: string;
    selectedTo?: string;
    lastOutputRange?: StringifiedDateRange;
};

export type StringifiedDateRange = {
    from?: string;
    to?: string;
    timeZone?: string;
};

type SetActive = {type: 'SET_ACTIVE'; payload: {active: boolean}};
type SetUpdate = {type: 'SET_UPDATE'; payload: {callOnUpdate: boolean}};
type SetClearHovered = {type: 'SET_CLEAR_HOVERED'; payload: {clearHovered: boolean}};
type SetErrors = {type: 'SET_ERRORS'; payload: {errors: State['errors']}};
type SetFrom = {
    type: 'SET_FROM';
    payload: {selectedFrom?: string; errors?: State['errors']; callOnUpdate?: boolean};
};
type SetTo = {
    type: 'SET_TO';
    payload: {selectedTo?: string; errors?: State['errors']; callOnUpdate?: boolean};
};
type SetFromTo = {
    type: 'SET_FROM_TO';
    payload: {
        selectedFrom?: string;
        selectedTo?: string;
        errors?: State['errors'];
        callOnUpdate?: boolean;
    };
};
type SetTimeZone = {type: 'SET_TIMEZONE'; payload: {selectedTimeZone?: string}};
type SetLastOutputRange = {
    type: 'SET_LAST_OUTPUT_RANGE';
    payload: {lastOutputRange: StringifiedDateRange};
};

export type Action =
    | SetActive
    | SetUpdate
    | SetClearHovered
    | SetErrors
    | SetFrom
    | SetTo
    | SetFromTo
    | SetTimeZone
    | SetLastOutputRange;

export type Dispatch = React.Dispatch<Action>;
