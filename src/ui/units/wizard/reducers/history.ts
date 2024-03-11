import {ResetWizardStoreAction, SetWizardStoreAction} from '../actions';
import {ADD_HISTORY_POINT, HistoryAction, SET_HISTORY_STATE} from '../actions/history';

export interface HistoryState {
    states: any;
    historyPointIndex: number;
}

const initialState: HistoryState = {
    states: [],
    historyPointIndex: -1,
};

export function history(
    state = initialState,
    action: HistoryAction | ResetWizardStoreAction | SetWizardStoreAction,
): HistoryState {
    switch (action.type) {
        case ADD_HISTORY_POINT: {
            const {pointState} = action;
            const {states, historyPointIndex} = state;

            const prevStates = states.slice(0, historyPointIndex + 1);

            return {
                ...state,

                // Force current history point index to latest state
                historyPointIndex: historyPointIndex + 1,

                states: [...prevStates, pointState],
            };
        }
        case SET_HISTORY_STATE: {
            const {state: newState} = action;

            return {
                ...newState,
            };
        }
        default:
            return state;
    }
}
