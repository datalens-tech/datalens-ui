import type {RealTheme} from '@gravity-ui/uikit';

import {
    DARK_HC_THEME_MONACO,
    DARK_THEME_MONACO,
    DATALENS_DARK_HC_THEME_MONACO,
    DATALENS_DARK_THEME_MONACO,
    DATALENS_LIGHT_HC_THEME_MONACO,
    DATALENS_LIGHT_THEME_MONACO,
    LIGHT_HC_THEME_MONACO,
    LIGHT_THEME_MONACO,
} from '../../constants/common';
import logger from '../../libs/logger';

import type {DlMonacoTheme, MonacoTypes} from './types';
export const mapUIKitThemeToMonacoTheme = (uikitTheme: RealTheme) => {
    switch (uikitTheme) {
        case 'light': {
            return LIGHT_THEME_MONACO;
        }
        case 'light-hc': {
            return LIGHT_HC_THEME_MONACO;
        }
        case 'dark': {
            return DARK_THEME_MONACO;
        }
        case 'dark-hc': {
            return DARK_HC_THEME_MONACO;
        }
        default: {
            logger.logError(`Unknown theme value ${uikitTheme}`);
            return LIGHT_THEME_MONACO;
        }
    }
};

export const mapUIKitThemeToDlMonacoTheme = (uikitTheme: RealTheme) => {
    switch (uikitTheme) {
        case 'light': {
            return DATALENS_LIGHT_THEME_MONACO;
        }
        case 'light-hc': {
            return DATALENS_LIGHT_HC_THEME_MONACO;
        }
        case 'dark': {
            return DATALENS_DARK_THEME_MONACO;
        }
        case 'dark-hc': {
            return DATALENS_DARK_HC_THEME_MONACO;
        }
        default: {
            logger.logError(`Unknown theme value ${uikitTheme}`);
            return DATALENS_LIGHT_THEME_MONACO;
        }
    }
};

export const mapDlMonacoThemeToMonacoTheme = (
    dlTheme: DlMonacoTheme,
): MonacoTypes.editor.BuiltinTheme => {
    switch (dlTheme) {
        case DATALENS_LIGHT_THEME_MONACO: {
            return LIGHT_THEME_MONACO;
        }
        case DATALENS_LIGHT_HC_THEME_MONACO: {
            return LIGHT_HC_THEME_MONACO;
        }
        case DATALENS_DARK_THEME_MONACO: {
            return DARK_THEME_MONACO;
        }
        case DATALENS_DARK_HC_THEME_MONACO: {
            return DARK_HC_THEME_MONACO;
        }
        default: {
            logger.logError(`Unknown theme value ${dlTheme}`);
            return LIGHT_THEME_MONACO;
        }
    }
};
