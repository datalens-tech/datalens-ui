import type {RealTheme, Theme, ThemeSettings} from '@gravity-ui/uikit';

type ThemesArray = ReadonlyArray<Exclude<RealTheme, object>>;

export const LIGHT_THEME = 'light';
export const LIGHT_THEME_HC = 'light-hc';
export const DARK_THEME = 'dark';
export const DARK_THEME_HC = 'dark-hc';
export const SYSTEM_THEME = 'system';

export const THEMES: ThemesArray = [LIGHT_THEME, DARK_THEME];
export const CONTRAST_THEMES: ThemesArray = [LIGHT_THEME_HC, DARK_THEME_HC];

export const ALLOW_THEMES: ReadonlyArray<RealTheme> = [...THEMES, ...CONTRAST_THEMES, SYSTEM_THEME];

export const CONTRAST_THEME_SETTINGS: ThemeSettings = {
    systemDarkTheme: DARK_THEME_HC,
    systemLightTheme: LIGHT_THEME_HC,
};

export const DEFAULT_THEME_SETTINGS: ThemeSettings = {
    systemDarkTheme: DARK_THEME,
    systemLightTheme: LIGHT_THEME,
};

export const DEFAULT_THEME_CONFIG: {
    theme: Theme;
    themeSettings: ThemeSettings;
} = {
    theme: SYSTEM_THEME,
    themeSettings: DEFAULT_THEME_SETTINGS,
};
