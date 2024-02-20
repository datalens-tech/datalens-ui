import {DatalensGlobalState} from 'ui/index';

import {DashState} from '../../reducers/dashTypedReducer';

export const selectSelectorsGroup = (state: DatalensGlobalState) =>
    (state.dash as DashState).selectorsGroup;

export const selectActiveSelectorIndex = (state: DatalensGlobalState) =>
    (state.dash as DashState).activeSelectorIndex || 0;
