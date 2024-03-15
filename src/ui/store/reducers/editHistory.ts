import {AnyAction} from 'redux';

import {
    INIT_EDIT_HISTORY_UNIT,
    RESET_EDIT_HISTORY_UNIT,
    ADD_EDIT_HISTORY_POINT,
    SET_EDIT_HISTORY_POINT_INDEX,
    EditHistoryAction,
} from '../actions/editHistory';

export type EditHistoryUnit = {
    states: unknown[];
    historyPointIndex: number;
    setState: ({state}: {state: unknown}) => AnyAction;
};

export interface EditHistoryState {
    units: Record<string, EditHistoryUnit>;
}

const initialState: EditHistoryState = {
    units: {},
};

export function editHistory(state = initialState, action: EditHistoryAction): EditHistoryState {
    switch (action.type) {
        case INIT_EDIT_HISTORY_UNIT: {
            const {unitId, setState} = action;

            return {
                ...state,
                units: {
                    ...state.units,

                    [unitId]: {
                        historyPointIndex: -1,
                        states: [],
                        setState,
                    },
                },
            };
        }
        case RESET_EDIT_HISTORY_UNIT: {
            const {unitId} = action;

            return {
                ...state,
                units: {
                    ...state.units,

                    [unitId]: {
                        historyPointIndex: -1,
                        states: [],
                        setState: state.units[unitId].setState,
                    },
                },
            };
        }
        case ADD_EDIT_HISTORY_POINT: {
            const {unitId, pointState} = action;

            const editHistoryUnit = state.units[unitId];

            const {states, historyPointIndex, setState} = editHistoryUnit;

            const prevStates = states.slice(0, historyPointIndex + 1);

            return {
                ...state,

                units: {
                    ...state.units,
                    [unitId]: {
                        // Force current history point index to latest state
                        historyPointIndex: historyPointIndex + 1,

                        states: [...prevStates, pointState],

                        setState,
                    },
                },
            };
        }
        case SET_EDIT_HISTORY_POINT_INDEX: {
            const {unitId, historyPointIndex} = action;

            const editHistoryUnit = state.units[unitId];

            return {
                ...state,

                units: {
                    ...state.units,
                    [unitId]: {
                        ...editHistoryUnit,
                        historyPointIndex,
                    },
                },
            };
        }
        default:
            return state;
    }
}
