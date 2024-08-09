import type {ThemeSettings} from '@gravity-ui/uikit';

export const LIGHT_THEME = 'light';
export const LIGHT_THEME_HC = 'light-hc';
export const DARK_THEME = 'dark';
export const DARK_THEME_HC = 'dark-hc';
export const SYSTEM_THEME = 'system';

export const THEMES = [LIGHT_THEME, DARK_THEME];
export const CONTRAST_THEMES = [LIGHT_THEME_HC, DARK_THEME_HC];

export const ALLOW_THEMES = [...THEMES, ...CONTRAST_THEMES, SYSTEM_THEME];

export const HIGH_CONTRAST_THEME_SETTINGS: ThemeSettings = {
    systemDarkTheme: DARK_THEME_HC,
    systemLightTheme: LIGHT_THEME_HC,
};

const THEME_SETTINGS: ThemeSettings = {
    systemDarkTheme: DARK_THEME,
    systemLightTheme: LIGHT_THEME,
};

export const DEFAULT_THEME_SETTINGS = {
    theme: SYSTEM_THEME,
    themeSettings: THEME_SETTINGS,
};
