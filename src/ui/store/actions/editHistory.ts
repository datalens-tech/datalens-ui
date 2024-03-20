import {cloneDeep} from 'lodash';
import {Dispatch} from 'redux';
import {create as jdpCreate, DiffContext as JDPDiffContext} from 'jsondiffpatch';

import {DatalensGlobalState} from 'ui';

import type {EditHistoryUnit, EditHistoryState, Diff} from '../reducers/editHistory';

const getPath = (ctx: JDPDiffContext): string => {
    if (ctx && ctx.parent) {
        return `${getPath(ctx.parent)}/${ctx.childName}`;
    } else {
        return `${ctx.childName || ''}`;
    }
};

export interface CreateJDPOptions {
    pathIgnoreList: string[];
}

// Plugin for jsondiffpatch to diff functions by its' references
const functionDiffFilter = (context: any) => {
    if (typeof context.left === 'function') {
        if (typeof context.right === 'function') {
            if (context.left === context.right) {
                context.setResult(undefined);
            } else {
                context.setResult([context.left, context.right]);
            }
        } else {
            context.setResult([context.left, context.right]);
        }

        context.exit();
    } else if (typeof context.right === 'function') {
        context.setResult([context.left, context.right]).exit();
    }
};

functionDiffFilter.filterName = 'function';

const createJDP = ({pathIgnoreList}: CreateJDPOptions) => {
    const jdp = jdpCreate({
        propertyFilter: function (name: string, ctx: JDPDiffContext) {
            const propertyPath = `${getPath(ctx)}/${name}`;

            return !pathIgnoreList.includes(propertyPath);
        },
    });

    jdp.processor.pipes.diff.before('trivial', functionDiffFilter);

    return jdp;
};

export const INIT_EDIT_HISTORY_UNIT = Symbol('editHistory/INIT_EDIT_HISTORY_UNIT');
export const RESET_EDIT_HISTORY_UNIT = Symbol('editHistory/RESET_EDIT_HISTORY_UNIT');
export const ADD_EDIT_HISTORY_POINT = Symbol('editHistory/ADD_EDIT_HISTORY_POINT');
export const SET_EDIT_HISTORY_POINT_INDEX = Symbol('editHistory/SET_EDIT_HISTORY_POINT_INDEX');
export const SET_EDIT_HISTORY_CURRENT_STATE = Symbol('editHistory/SET_EDIT_HISTORY_CURRENT_STATE');

interface AddEditHistoryPointAction {
    type: typeof ADD_EDIT_HISTORY_POINT;
    unitId: string;
    diff: Diff | null;
    state: unknown;
}

function _addEditHistoryPoint({
    unitId,
    diff,
    state,
}: Omit<AddEditHistoryPointAction, 'type'>): AddEditHistoryPointAction {
    return {
        type: ADD_EDIT_HISTORY_POINT,
        unitId,
        diff,
        state,
    };
}

interface InitEditHistoryUnitAction {
    type: typeof INIT_EDIT_HISTORY_UNIT;
    unitId: string;
    setState: EditHistoryUnit['setState'];
    options: CreateJDPOptions;
}

export function initEditHistoryUnit({
    unitId,
    setState,
    options,
}: Omit<InitEditHistoryUnitAction, 'type'>) {
    return {
        type: INIT_EDIT_HISTORY_UNIT,
        unitId,
        setState,
        options,
    };
}

interface ResetEditHistoryUnitAction {
    type: typeof RESET_EDIT_HISTORY_UNIT;
    unitId: string;
}

export function resetEditHistoryUnit({unitId}: Omit<ResetEditHistoryUnitAction, 'type'>) {
    return {
        type: RESET_EDIT_HISTORY_UNIT,
        unitId,
    };
}

interface SetEditHistoryPointIndexAction {
    type: typeof SET_EDIT_HISTORY_POINT_INDEX;
    unitId: string;
    pointIndex: number;
}

function _setEditHistoryPointIndex({
    unitId,
    pointIndex,
}: Omit<SetEditHistoryPointIndexAction, 'type'>): SetEditHistoryPointIndexAction {
    return {
        type: SET_EDIT_HISTORY_POINT_INDEX,
        unitId,
        pointIndex,
    };
}

interface SetEditHistoryPointStateAction {
    type: typeof SET_EDIT_HISTORY_CURRENT_STATE;
    unitId: string;
    pointState: unknown;
}

function _setEditHistoryCurrentState({
    unitId,
    pointState,
}: Omit<SetEditHistoryPointStateAction, 'type'>): SetEditHistoryPointStateAction {
    return {
        type: SET_EDIT_HISTORY_CURRENT_STATE,
        unitId,
        pointState,
    };
}

export function addEditHistoryPoint({unitId}: {unitId: string}) {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();
        const {
            wizard: wizardState,
            editHistory: {units},
        } = globalState;

        const newState = cloneDeep(wizardState);

        const unit = _getTargetUnit({units, unitId});

        let diff = null;

        const jdp = createJDP(unit.options);

        // If unit.pointState is not initialized yet, then this is first state
        // First state does not have any diffs, because it is first and initial
        if (unit.pointState) {
            const oldState = unit.pointState;

            diff = jdp.diff(oldState, newState);
        }

        dispatch(_addEditHistoryPoint({unitId, diff, state: newState}));
    };
}

function _getTargetUnit({units, unitId}: {units: EditHistoryState['units']; unitId: string}) {
    const targetUnit = units[unitId];

    if (!targetUnit) {
        throw new Error('Specified history unit does not exist');
    }

    return targetUnit;
}

export function goBack({unitId}: {unitId: string}) {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();

        const {units} = globalState.editHistory;

        const unit = _getTargetUnit({units, unitId});

        const {diffs, pointIndex, pointState, setState} = unit;

        const targetIndex = pointIndex;

        const targetDiff = diffs[targetIndex];

        if (!targetDiff) {
            throw new Error('History point index out of bounds');
        }

        const jdp = createJDP(unit.options);

        // Unapply last diff
        const targetState = jdp.unpatch(cloneDeep(pointState), targetDiff);

        dispatch(
            _setEditHistoryPointIndex({
                unitId,
                pointIndex: targetIndex - 1,
            }),
        );

        dispatch(_setEditHistoryCurrentState({unitId, pointState: targetState}));

        dispatch(setState({state: targetState}));
    };
}

export function goForward({unitId}: {unitId: string}) {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();

        const {units} = globalState.editHistory;

        const unit = _getTargetUnit({units, unitId});

        const {diffs, pointIndex, pointState, setState} = unit;

        // New point index will be at next index
        const targetIndex = pointIndex + 1;

        const targetDiff = diffs[targetIndex];

        if (!targetDiff) {
            throw new Error('History point index out of bounds');
        }

        const jdp = createJDP(unit.options);

        // Apply next diff
        const targetState = jdp.patch(cloneDeep(pointState), targetDiff);

        dispatch(
            _setEditHistoryPointIndex({
                unitId,
                pointIndex: targetIndex,
            }),
        );

        dispatch(_setEditHistoryCurrentState({unitId, pointState: targetState}));

        dispatch(setState({state: targetState}));
    };
}

export type EditHistoryAction =
    | InitEditHistoryUnitAction
    | ResetEditHistoryUnitAction
    | AddEditHistoryPointAction
    | SetEditHistoryPointIndexAction
    | SetEditHistoryPointStateAction;
