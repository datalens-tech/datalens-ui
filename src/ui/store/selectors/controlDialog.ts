import type {DatalensGlobalState} from 'ui/index';

export const selectSelectorsGroup = (state: DatalensGlobalState) =>
    (state.dash as DatalensGlobalState['dash']).selectorsGroup;

export const selectActiveSelectorIndex = (state: DatalensGlobalState) =>
    (state.dash as DatalensGlobalState['dash']).activeSelectorIndex || 0;
