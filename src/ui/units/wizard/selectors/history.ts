import {DatalensGlobalState} from 'ui';

export const selectCanGoBack = (state: DatalensGlobalState) =>
    state.wizard.history.historyPointIndex > 0;

export const selectCanGoForward = (state: DatalensGlobalState) =>
    state.wizard.history.historyPointIndex < state.wizard.history.states.length - 1;
