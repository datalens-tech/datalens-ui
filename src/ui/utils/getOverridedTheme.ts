import type {Theme} from '@gravity-ui/uikit';
import {ALLOW_THEMES} from 'shared';

import Utils from './utils';

export const getOverridedTheme = (defaultTheme: Theme) => {
    const queryTheme = Utils.getOptionsFromSearch(window.location.search)
        .theme as (typeof ALLOW_THEMES)[number];

    return ALLOW_THEMES.includes(queryTheme) ? queryTheme : defaultTheme;
};
