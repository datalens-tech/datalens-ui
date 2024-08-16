import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'ui';

export const selectUserSettings = (state: DatalensGlobalState) => state.user.settings.data;

export const selectTheme = (state: DatalensGlobalState) => state.user.theme;

export const selectThemeSettings = (state: DatalensGlobalState) => state.user.themeSettings;

export const selectDebugMode = createSelector(
    selectUserSettings,
    (userSettings) => userSettings.dlDebugMode || false,
);

export const selectFieldEditorDocShown = createSelector(
    selectUserSettings,
    (userSettings) => userSettings.dlFieldEditorDocShown || false,
);

export const selectdGsheetAuthHintShown = createSelector(
    selectUserSettings,
    (userSettings) => userSettings.dlGsheetAuthHintShown || false,
);

export const selectUserTheme = createSelector(
    [selectUserSettings],
    (userSettings) => userSettings.theme || 'system',
);

export const selectUserThemeSettings = createSelector(
    [selectUserSettings],
    (userSettings) => userSettings.themeSettings,
);

export const selectSandboxDebugMode = createSelector(
    selectUserSettings,
    (userSettings) => userSettings.dlSanboxDebugMode || false,
);
