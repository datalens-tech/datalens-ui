import {AnyAction} from 'redux';
import {Delta as JDPDelta} from 'jsondiffpatch';

import {
    INIT_EDIT_HISTORY_UNIT,
    RESET_EDIT_HISTORY_UNIT,
    ADD_EDIT_HISTORY_POINT,
    SET_EDIT_HISTORY_POINT_INDEX,
    SET_EDIT_HISTORY_CURRENT_STATE,
    EditHistoryAction,
} from '../actions/editHistory';

import {CreateJDPOptions} from '../utils/jdp';

export type Diff = JDPDelta;

export type EditHistoryUnit = {
    diffs: Diff[];
    pointIndex: number;
    pointState?: unknown;
    setState: ({state}: {state: unknown}) => AnyAction;
    options: CreateJDPOptions;
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
            const {unitId, setState, options} = action;

            return {
                units: {
                    ...state.units,
                    [unitId]: {
                        pointIndex: -1,
                        diffs: [],
                        setState,
                        options,
                    },
                },
            };
        }
        case RESET_EDIT_HISTORY_UNIT: {
            const {unitId} = action;

            const unit = state.units[unitId];

            return {
                units: {
                    ...state.units,
                    [unitId]: {
                        ...unit,

                        pointIndex: -1,
                        diffs: [],
                    },
                },
            };
        }
        case ADD_EDIT_HISTORY_POINT: {
            const {unitId, diff, state: newState} = action;

            const editHistoryUnit = state.units[unitId];

            const {diffs, pointIndex} = editHistoryUnit;

            const prevDiffs = diffs.slice(0, pointIndex + 1);

            return {
                units: {
                    ...state.units,
                    [unitId]: {
                        ...editHistoryUnit,

                        // Force current history point index to latest state
                        pointIndex: pointIndex + 1,

                        // Remove all missed diffs
                        diffs: [...prevDiffs, diff],

                        pointState: newState,
                    },
                },
            };
        }
        case SET_EDIT_HISTORY_POINT_INDEX: {
            const {unitId, pointIndex} = action;

            const editHistoryUnit = state.units[unitId];

            return {
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
