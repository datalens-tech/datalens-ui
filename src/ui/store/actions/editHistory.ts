import {cloneDeep} from 'lodash';
import {Dispatch} from 'redux';
import {DatalensGlobalState} from 'ui';

import type {EditHistoryUnit, EditHistoryState} from '../reducers/editHistory';

export const INIT_EDIT_HISTORY_UNIT = Symbol('editHistory/INIT_EDIT_HISTORY_UNIT');
export const ADD_EDIT_HISTORY_POINT = Symbol('editHistory/ADD_EDIT_HISTORY_POINT');
export const SET_EDIT_HISTORY_POINT_INDEX = Symbol('editHistory/SET_EDIT_HISTORY_POINT_INDEX');

interface AddEditHistoryPointAction {
    type: typeof ADD_EDIT_HISTORY_POINT;
    unitId: string;
    pointState: unknown;
}

function _addEditHistoryPoint({
    unitId,
    pointState,
}: Omit<AddEditHistoryPointAction, 'type'>): AddEditHistoryPointAction {
    return {
        type: ADD_EDIT_HISTORY_POINT,
        unitId,
        pointState,
    };
}

interface InitEditHistoryUnitAction {
    type: typeof INIT_EDIT_HISTORY_UNIT;
    unitId: string;
    setState: EditHistoryUnit['setState'];
}

export function initEditHistoryUnit({unitId, setState}: Omit<InitEditHistoryUnitAction, 'type'>) {
    return {
        type: INIT_EDIT_HISTORY_UNIT,
        unitId,
        setState,
    };
}

interface SetEditHistoryPointIndexAction {
    type: typeof SET_EDIT_HISTORY_POINT_INDEX;
    unitId: string;
    historyPointIndex: number;
}

function _setEditHistoryPointIndex({
    unitId,
    historyPointIndex,
}: Omit<SetEditHistoryPointIndexAction, 'type'>): SetEditHistoryPointIndexAction {
    return {
        type: SET_EDIT_HISTORY_POINT_INDEX,
        unitId,
        historyPointIndex,
    };
}

export function addEditHistoryPoint({unitId}: {unitId: string}) {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();
        const {wizard: wizardState} = globalState;

        dispatch(_addEditHistoryPoint({unitId, pointState: cloneDeep(wizardState)}));
    };
}

function _getTargetUnit({units, unitId}: {units: EditHistoryState['units']; unitId: string}) {
    const targetUnit = units[unitId];

    if (!targetUnit) {
        throw new Error('Specified history unit does not exist');
    }

    return targetUnit;
}

function _getTargetState({
    states,
    historyPointIndex,
}: {
    states: unknown[];
    historyPointIndex: number;
}) {
    if (historyPointIndex < 0 || states.length - 1 < historyPointIndex) {
        throw new Error('History point index is out of borders');
    }

    return cloneDeep(states[historyPointIndex]);
}

export function goBack({unitId}: {unitId: string}) {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();

        const {units} = globalState.editHistory;

        const {states, historyPointIndex, setState} = _getTargetUnit({units, unitId});

        const targetIndex = historyPointIndex - 1;

        const targetState = _getTargetState({states, historyPointIndex: targetIndex});

        dispatch(
            _setEditHistoryPointIndex({
                unitId,
                historyPointIndex: targetIndex,
            }),
        );

        dispatch(setState({state: targetState}));
    };
}

export function goForward({unitId}: {unitId: string}) {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();

        const {units} = globalState.editHistory;

        const {states, historyPointIndex, setState} = _getTargetUnit({units, unitId});

        const targetIndex = historyPointIndex + 1;

        const targetState = _getTargetState({states, historyPointIndex: targetIndex});

        dispatch(
            _setEditHistoryPointIndex({
                unitId,
                historyPointIndex: targetIndex,
            }),
        );

        dispatch(setState({state: targetState}));
    };
}

export type EditHistoryAction =
    | InitEditHistoryUnitAction
    | AddEditHistoryPointAction
    | SetEditHistoryPointIndexAction;
