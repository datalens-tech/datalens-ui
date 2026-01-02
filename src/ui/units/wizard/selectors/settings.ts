import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'ui';
import {DL, URL_QUERY} from 'ui';
import {getLocation} from 'ui/navigation';

import {selectDataset} from './dataset';
import {selectWidget} from './widget';

export const selectSettings = (state: DatalensGlobalState) => state.wizard.settings;

export const selectIsNavigationVisible = (state: DatalensGlobalState) =>
    state.wizard.settings.isNavigationVisible;

export const selectIsFullscreen = (state: DatalensGlobalState) =>
    state.wizard.settings.isFullscreen;

export const selectViewOnlyMode = (state: DatalensGlobalState) =>
    state.wizard.settings.isViewOnlyMode;

export const selectDefaultPath = (state: DatalensGlobalState) => {
    const widget = selectWidget(state);

    if (widget.fake) {
        const searchCurrentPath = getLocation().params().get(URL_QUERY.CURRENT_PATH);
        if (searchCurrentPath) {
            return searchCurrentPath;
        }

        const dataset = selectDataset(state);

        if (dataset?.key) {
            return dataset.key.replace(/[^/]+$/, '');
        }
    }

    return DL.USER_LOGIN ? DL.USER_FOLDER : '/';
};

export const selectIsDefaultsSet = (state: DatalensGlobalState) =>
    state.wizard.settings.defaultsSet;

export const selectRouteWorkbookId = (state: DatalensGlobalState) =>
    state.wizard.settings.routeWorkbookId;

export const selectWizardWorkbookId = createSelector(
    selectRouteWorkbookId,
    selectWidget,
    (routeWorkbookId, widget) => routeWorkbookId || (widget.workbookId as string | null) || null,
);
