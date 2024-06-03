import type * as MonacoTypes from 'monaco-editor';

import type {
    DATALENS_DARK_HC_THEME_MONACO,
    DATALENS_DARK_THEME_MONACO,
    DATALENS_LIGHT_HC_THEME_MONACO,
    DATALENS_LIGHT_THEME_MONACO,
} from '../../constants/common';

export type {MonacoTypes};

export type DlMonacoTheme =
    | typeof DATALENS_LIGHT_THEME_MONACO
    | typeof DATALENS_LIGHT_HC_THEME_MONACO
    | typeof DATALENS_DARK_THEME_MONACO
    | typeof DATALENS_DARK_HC_THEME_MONACO;
