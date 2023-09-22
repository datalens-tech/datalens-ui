import {I18n} from 'i18n';

const i18n = I18n.keyset('components.common.Datepicker');

export const MINUTES_IN_HOUR = 60;

export const AVAILABLE_POPUP_PLACEMENT = ['bottom-start', 'bottom-end', 'top-start', 'top-end'];

export const WEEKDAYS = {
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
    SUNDAY: 7,
};

export const MONTHS = {
    JANUARY: 1,
    FEBRUARY: 2,
    MARCH: 3,
    APRIL: 4,
    MAY: 5,
    JUNE: 6,
    JULY: 7,
    AUGUST: 8,
    SEPTEMBER: 9,
    OCTOBER: 10,
    NOVEMBER: 11,
    DECEMBER: 12,
};

export const TABS = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    QUARTER: 'quarter',
    YEAR: 'year',
};

export const DISPLAY_FORMAT = {
    DATE: 'dd.MM.yyyy',
    DATETIME: 'dd.MM.yyyy HH:mm:ss',
};

export const OUTPUT_FORMAT = {
    DATE: 'date',
    DATETIME: 'datetime',
};

export function getTabs() {
    return [TABS.DAY, TABS.WEEK, TABS.MONTH, TABS.QUARTER, TABS.YEAR].map((tab) => ({
        id: tab,
        title: i18n(`tab_${tab}`),
    }));
}
