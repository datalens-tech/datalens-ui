import type {Theme} from '@gravity-ui/uikit';
import {ALLOW_THEMES} from 'shared';
import {getLocation} from 'ui/navigation';

import Utils from './utils';

export const getOverridedTheme = (defaultTheme: Theme) => {
    const queryTheme = Utils.getOptionsFromSearch(getLocation().search)
        .theme as (typeof ALLOW_THEMES)[number];

    return ALLOW_THEMES.includes(queryTheme) ? queryTheme : defaultTheme;
};
