import {I18n} from 'i18n';

const i18n = I18n.keyset('component.chart-modeling-settings');

export const SMOOTHING_SELECT_OPTION = [{value: 'sma', label: i18n('label_simple-moving-average')}];

export const TREND_SELECT_OPTION = [
    {value: 'linear', label: i18n('label_linear')},
    {value: 'quadratic', label: i18n('label_quadratic')},
    {value: 'cubic', label: i18n('label_cubic')},
];

export const MAX_LINE_WIDTH = 12;
