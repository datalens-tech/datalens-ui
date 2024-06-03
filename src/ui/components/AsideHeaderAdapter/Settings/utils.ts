import type {ThemeSettings} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import type {DLUserSettings} from 'shared/types/common';
import {DARK_THEME, LIGHT_THEME, SYSTEM_THEME} from 'ui/constants';

import type {ThemeSettingsUpdates} from './types';
import {HighcontrastValue} from './types';

const i18n = I18n.keyset('component.aside-header-settings.view');

const DEFAULT_THEME_SETTINGS = {
    theme: 'system',
    themeSettings: {systemDarkTheme: 'dark', systemLightTheme: 'light'},
};

export const getLocalTheme = (): {theme: string; themeSettings: ThemeSettings} => {
    const rawUserSettings = localStorage.getItem('userSettings');

    if (!rawUserSettings) {
        return DEFAULT_THEME_SETTINGS;
    }

    const parsedUserSettings: Partial<DLUserSettings> = JSON.parse(rawUserSettings);

    return {
        theme: parsedUserSettings.theme || DEFAULT_THEME_SETTINGS.theme,
        themeSettings: parsedUserSettings.themeSettings || DEFAULT_THEME_SETTINGS.themeSettings,
    };
};

export const isHcEnabled = (settings?: ThemeSettings) => {
    return settings?.systemLightTheme === 'light-hc';
};

const getThemeValue = (themeType: string, hcEnabled: boolean) => {
    return `${themeType}${hcEnabled ? '-hc' : ''}`;
};

export const getThemeUpdates = (
    theme: string,
    themeType: string,
    hcEnabled: boolean,
): ThemeSettingsUpdates => {
    return {
        theme: theme === SYSTEM_THEME ? theme : getThemeValue(themeType, hcEnabled),
        themeSettings: {
            systemLightTheme: getThemeValue('light', hcEnabled),
            systemDarkTheme: getThemeValue('dark', hcEnabled),
        },
    };
};

export const getThemeOptions = () => [
    {value: LIGHT_THEME, content: i18n('value_theme-light')},
    {value: DARK_THEME, content: i18n('value_theme-dark')},
    {value: SYSTEM_THEME, content: i18n('value_theme-system')},
];
export const getHighcontrastOptions = () => [
    {value: HighcontrastValue.normal, content: i18n('value_theme-contrast-normal')},
    {value: HighcontrastValue.hc, content: i18n('value_theme-contrast-enhanced')},
];
