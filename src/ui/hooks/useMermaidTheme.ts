import {getThemeType, useThemeValue} from '@gravity-ui/uikit';

export const useMermaidTheme = (): 'dark' | 'default' => {
    return getThemeType(useThemeValue()) === 'dark' ? 'dark' : 'default';
};
