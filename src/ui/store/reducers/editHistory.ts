import isObject from 'lodash/isObject';
import isSet from 'lodash/isSet';
import isFunction from 'lodash/isFunction';
import transform from 'lodash/transform';

import type {Delta as JDPDelta} from 'jsondiffpatch';

import type {EditHistoryAction} from '../actions/editHistory';
import {
    INIT_EDIT_HISTORY_UNIT,
    RESET_EDIT_HISTORY_UNIT,
    ADD_EDIT_HISTORY_POINT,
    SET_EDIT_HISTORY_POINT_INDEX,
    SET_EDIT_HISTORY_CURRENT_STATE,
} from '../actions/editHistory';

import type {CreateJDPOptions} from '../utils/jdp';

export type Diff = JDPDelta;

export type EditHistoryUnit<T = unknown> = {
    diffs: (Diff | Diff[])[];
    pointIndex: number;
    pointState?: T;
    setState: ({state}: {state: T}) => void;
    options: CreateJDPOptions;
};

export interface EditHistoryState {
    units: Record<string, EditHistoryUnit>;
}

const initialState: EditHistoryState = {
    units: {},
};

const cloneStateForHistory = (state: unknown, pathIgnoreList: string[]) => {
    const deepOmitBy = (value: unknown, path: string, iteratee: (key: string) => boolean) => {
        if (isObject(value) && !isSet(value) && !isFunction(value)) {
            return transform(value, (result: Record<string, unknown>, item, key) => {
                if (typeof item === 'function') {
                    // eslint-disable-next-line no-param-reassign
                    result[key] = item;
                } else {
                    const itemPath = `${path}/${key}`;

                    if (!iteratee(itemPath)) {
                        // eslint-disable-next-line no-param-reassign
                        result[key] = deepOmitBy(item, itemPath, iteratee);
                    }
                }
            });
        } else {
            return value;
        }
    };

    return deepOmitBy(state, '', (path: string) => pathIgnoreList.includes(path));
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
            const {unitId, diff, state: newState, stacked} = action;

            const editHistoryUnit = state.units[unitId];

            const {diffs, pointIndex} = editHistoryUnit;

            const prevDiffs = diffs.slice(0, pointIndex + 1);

            const storedNewState = cloneStateForHistory(
                newState,
                editHistoryUnit.options.pathIgnoreList,
            );

            const nextPointIndex = pointIndex + (stacked ? 0 : 1);
            let nextDiffs: (Diff | Diff[])[];

            if (stacked) {
                if (!Array.isArray(prevDiffs[prevDiffs.length - 1])) {
                    prevDiffs[prevDiffs.length - 1] = [prevDiffs[prevDiffs.length - 1]];
                }

                (prevDiffs[prevDiffs.length - 1] as Diff[]).push(diff);
                nextDiffs = [...prevDiffs];
            } else {
                nextDiffs = [...prevDiffs, diff];
            }

            return {
                units: {
                    ...state.units,
                    [unitId]: {
                        ...editHistoryUnit,

                        // Force current history point index to latest state
                        pointIndex: nextPointIndex,

                        diffs: nextDiffs,

                        pointState: storedNewState,
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

            const storedPointState = cloneStateForHistory(
                pointState,
                editHistoryUnit.options.pathIgnoreList,
            );

            return {
                units: {
                    ...state.units,
                    [unitId]: {
                        ...editHistoryUnit,
                        pointState: storedPointState,
                    },
                },
            };
        }
        default:
            return state;
    }
}
