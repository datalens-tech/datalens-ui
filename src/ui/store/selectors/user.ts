import {createSelector} from 'reselect';
import type {OutputSelector} from 'reselect';
import type {ThemeSettings} from '@gravity-ui/uikit';
import type {DLUserSettings} from 'shared';
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

export const selectUserTheme: OutputSelector<
    DatalensGlobalState,
    string,
    (res: DLUserSettings) => string
> = createSelector([selectUserSettings], (userSettings) => userSettings.theme || 'system');

export const selectUserThemeSettings: OutputSelector<
    DatalensGlobalState,
    ThemeSettings | undefined,
    (res: DLUserSettings) => ThemeSettings | undefined
> = createSelector([selectUserSettings], (userSettings) => userSettings.themeSettings);
