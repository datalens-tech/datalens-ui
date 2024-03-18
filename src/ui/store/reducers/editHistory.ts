import {AnyAction} from 'redux';
import * as jsondiffpatch from 'jsondiffpatch';

import {
    INIT_EDIT_HISTORY_UNIT,
    RESET_EDIT_HISTORY_UNIT,
    ADD_EDIT_HISTORY_POINT,
    SET_EDIT_HISTORY_POINT_INDEX,
    EditHistoryAction,
    SET_EDIT_HISTORY_CURRENT_STATE,
} from '../actions/editHistory';

export type Diff = jsondiffpatch.Delta;

export type EditHistoryUnit = {
    diffs: (Diff | null)[];
    pointIndex: number;
    pointState: unknown;
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
                        pointIndex: -1,
                        diffs: [],
                        pointState: null,
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
                        pointIndex: -1,
                        diffs: [],
                        pointState: null,
                        setState: state.units[unitId].setState,
                    },
                },
            };
        }
        case ADD_EDIT_HISTORY_POINT: {
            const {unitId, diff, state: newState} = action;

            const editHistoryUnit = state.units[unitId];

            const {diffs, pointIndex, setState} = editHistoryUnit;

            const prevDiffs = diffs.slice(0, pointIndex + 1);

            return {
                ...state,

                units: {
                    ...state.units,
                    [unitId]: {
                        // Force current history point index to latest state
                        pointIndex: pointIndex + 1,

                        diffs: [...prevDiffs, diff],

                        pointState: newState,

                        setState,
                    },
                },
            };
        }
        case SET_EDIT_HISTORY_POINT_INDEX: {
            const {unitId, pointIndex} = action;

            const editHistoryUnit = state.units[unitId];

            return {
                ...state,

                units: {
                    ...state.units,
                    [unitId]: {
                        ...editHistoryUnit,
                        pointIndex,
                    },
                },
            };
        }
        case SET_EDIT_HISTORY_CURRENT_STATE: {
            const {unitId, pointState} = action;

            const editHistoryUnit = state.units[unitId];

            return {
                ...state,

                units: {
                    ...state.units,
                    [unitId]: {
                        ...editHistoryUnit,
                        pointState,
                    },
                },
            };
        }
        default:
            return state;
    }
}
