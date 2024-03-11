import {cloneDeep} from 'lodash';
import {Dispatch} from 'redux';
import {DatalensGlobalState} from 'ui';

import type {HistoryState} from '../reducers/history';

import {setWizardStore} from '.';

export const ADD_HISTORY_POINT = Symbol('wizard/history/ADD_HISTORY_POINT');
export const SET_HISTORY_STATE = Symbol('wizard/history/SET_HISTORY_STATE');

interface AddHistoryPointAction {
    type: typeof ADD_HISTORY_POINT;
    pointState: any;
}

function _addHistoryPoint({pointState}: {pointState: any}): AddHistoryPointAction {
    return {
        type: ADD_HISTORY_POINT,
        pointState,
    };
}

interface SetHistoryStateAction {
    type: typeof SET_HISTORY_STATE;
    state: HistoryState;
}

function _setHistoryState({state}: {state: HistoryState}): SetHistoryStateAction {
    return {
        type: SET_HISTORY_STATE,
        state,
    };
}

export function addHistoryPoint() {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();
        const {wizard: wizardState} = globalState;

        dispatch(_addHistoryPoint({pointState: cloneDeep(wizardState)}));
    };
}

export function goBack() {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();

        const {historyPointIndex, states} = globalState.wizard.history;

        const targetIndex = historyPointIndex - 1;

        if (targetIndex < 0) {
            return;
        }

        const targetState = states[targetIndex];

        dispatch(setWizardStore({store: targetState}));

        dispatch(
            _setHistoryState({
                state: {
                    states,
                    historyPointIndex: targetIndex,
                },
            }),
        );
    };
}

export function goForward() {
    return function (dispatch: Dispatch, getState: () => DatalensGlobalState) {
        const globalState = getState();

        const {historyPointIndex, states} = globalState.wizard.history;

        const targetIndex = historyPointIndex + 1;

        if (targetIndex > states.length - 1) {
            return;
        }

        const targetState = states[targetIndex];

        dispatch(setWizardStore({store: targetState}));

        dispatch(
            _setHistoryState({
                state: {
                    states,
                    historyPointIndex: targetIndex,
                },
            }),
        );
    };
}

export type HistoryAction = AddHistoryPointAction | SetHistoryStateAction;
