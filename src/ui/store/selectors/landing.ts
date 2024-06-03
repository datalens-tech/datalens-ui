import type {DatalensGlobalState} from 'index';

export const selectIsLanding = (state: DatalensGlobalState) => state.landing.isLanding;
