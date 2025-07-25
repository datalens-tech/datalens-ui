import {createSelector} from 'reselect';
import type {DatalensGlobalState} from 'ui';
import {DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT, TIME_FORMAT_12, TIME_FORMAT_24} from 'shared';

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

export const selectDateFormat = createSelector(
    [selectUserSettings],
    (userSettings) => userSettings.dateFormat,
);

export const selectTimeFormat = createSelector(
    [selectUserSettings],
    (userSettings) => userSettings.timeFormat,
);

export const selectDateTimeFormat = createSelector(
    [selectDateFormat, selectTimeFormat],
    (dateFormat = DEFAULT_DATE_FORMAT, timeFormat = DEFAULT_TIME_FORMAT) =>
        `${dateFormat === 'auto' ? 'L' : dateFormat} ${timeFormat === '12' ? TIME_FORMAT_12 : TIME_FORMAT_24}`,
);
