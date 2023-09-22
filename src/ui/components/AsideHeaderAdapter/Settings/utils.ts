import type {ThemeSettings} from '@gravity-ui/uikit';
import type {DLUserSettings} from 'shared/types/common';
import {SYSTEM_THEME} from 'ui/constants';

import {ThemeSettingsUpdates} from './types';

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
