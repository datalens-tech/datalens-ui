import type {DatalensGlobalState} from 'ui/index';

import type {DashState} from '../../reducers/dashTypedReducer';

export const selectSelectorsGroup = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorsGroup;

export const selectActiveSelectorIndex = (state: DatalensGlobalState) =>
    (state.dash as DashState).activeSelectorIndex || 0;
