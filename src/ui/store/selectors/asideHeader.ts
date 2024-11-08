import type {DatalensGlobalState} from 'ui';

export const selectAsideHeaderData = (state: DatalensGlobalState) =>
    state.asideHeader.asideHeaderData;

export const selectAsideHeaderIsCompact = (state: DatalensGlobalState) =>
    state.asideHeader.isCompact;

export const selectAsideHeaderIsHidden = (state: DatalensGlobalState) => state.asideHeader.isHidden;

export const selectAsideHeaderSettings = (state: DatalensGlobalState) => state.asideHeader.settings;

export const selectAsideHeaderPanelVisible = (state: DatalensGlobalState) =>
    state.asideHeader.panelVisible;

export const selectAsideHeaderPlace = (state: DatalensGlobalState) => state.asideHeader.place;

export const selectStartFromNavigation = (state: DatalensGlobalState) =>
    state.asideHeader.startFromNavigation;

export const selectCurrentPageEntry = (state: DatalensGlobalState) =>
    state.asideHeader.currentPageEntry;
