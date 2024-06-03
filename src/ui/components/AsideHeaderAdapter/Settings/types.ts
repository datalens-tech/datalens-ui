import type {Theme, ThemeSettings} from '@gravity-ui/uikit';

export type ThemeSettingsUpdates = {
    theme: Theme;
    themeSettings: ThemeSettings;
};

export enum HighcontrastValue {
    normal = 'normal',
    hc = 'hc',
}
