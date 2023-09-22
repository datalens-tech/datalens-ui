import {I18n} from 'i18n';

import {RangeDatepickerPresetTab} from './types';

const i18n = I18n.keyset('components.common.RangeDatepicker');

const MAIN_TAB = 'main';

export const OTHERS_TAB = 'others';

export const OUTPUT_FORMAT = 'YYYY-MM-DDTHH:mm:ss.sssZ';

export const DEFAULT_DATE_PRESETS = [
    {
        from: 'now-1d',
        to: 'now',
        get title() {
            return i18n('preset_last_1d');
        },
    },
    {
        from: 'now-3d',
        to: 'now',
        get title() {
            return i18n('preset_last_3d');
        },
    },
    {
        from: 'now-1w',
        to: 'now',
        get title() {
            return i18n('preset_last_1w');
        },
    },
    {
        from: 'now-1M',
        to: 'now',
        get title() {
            return i18n('preset_last_1M');
        },
    },
    {
        from: 'now-3M',
        to: 'now',
        get title() {
            return i18n('preset_last_3M');
        },
    },
    {
        from: 'now-6M',
        to: 'now',
        get title() {
            return i18n('preset_last_6M');
        },
    },
    {
        from: 'now-1y',
        to: 'now',
        get title() {
            return i18n('preset_last_1y');
        },
    },
    {
        from: 'now-3y',
        to: 'now',
        get title() {
            return i18n('preset_last_3y');
        },
    },
];

export const DEFAULT_TIME_PRESET_TAB: RangeDatepickerPresetTab = {
    id: MAIN_TAB,
    get title() {
        return i18n('tab_main');
    },
    presets: [
        {
            from: 'now-5m',
            to: 'now',
            get title() {
                return i18n('preset_last_5m');
            },
        },
        {
            from: 'now-30m',
            to: 'now',
            get title() {
                return i18n('preset_last_30m');
            },
        },
        {
            from: 'now-1h',
            to: 'now',
            get title() {
                return i18n('preset_last_1h');
            },
        },
        {
            from: 'now-3h',
            to: 'now',
            get title() {
                return i18n('preset_last_3h');
            },
        },
        {
            from: 'now-6h',
            to: 'now',
            get title() {
                return i18n('preset_last_6h');
            },
        },
        {
            from: 'now-12h',
            to: 'now',
            get title() {
                return i18n('preset_last_12h');
            },
        },
        ...DEFAULT_DATE_PRESETS,
    ],
};

export const DEFAULT_DATE_PRESET_TAB: RangeDatepickerPresetTab = {
    id: MAIN_TAB,
    get title() {
        return i18n('tab_main');
    },
    presets: DEFAULT_DATE_PRESETS,
};

export const DEFAULT_OTHERS_PRESET_TAB: RangeDatepickerPresetTab = {
    id: OTHERS_TAB,
    get title() {
        return i18n('tab_others');
    },
    presets: [
        {
            from: 'now/d',
            to: 'now/d+1d',
            get title() {
                return i18n('preset_today');
            },
        },
        {
            from: 'now-1d/d',
            to: 'now-1d/d+1d',
            get title() {
                return i18n('preset_yesterday');
            },
        },
        {
            from: 'now/w',
            to: 'now+1w/w',
            get title() {
                return i18n('preset_this_w');
            },
        },
        {
            from: 'now/M',
            to: 'now+1M/M',
            get title() {
                return i18n('preset_this_M');
            },
        },
        {
            from: 'now/y',
            to: 'now+1y/y',
            get title() {
                return i18n('preset_this_y');
            },
        },
        {
            from: 'now/d',
            to: 'now',
            get title() {
                return i18n('preset_from_start_of_d');
            },
        },
        {
            from: 'now/w',
            to: 'now',
            get title() {
                return i18n('preset_from_start_of_w');
            },
        },
        {
            from: 'now/M',
            to: 'now',
            get title() {
                return i18n('preset_from_start_of_M');
            },
        },
        {
            from: 'now/y',
            to: 'now',
            get title() {
                return i18n('preset_from_start_of_y');
            },
        },
    ],
};
