import {I18n} from 'i18n';

const i18n = I18n.keyset('component.chart-modeling-settings');

export function getChartModelingWarning(warnings?: string[]) {
    switch (warnings?.[0]) {
        case 'dataWithNull': {
            return {
                title: i18n('label_null-data-warning-short'),
                description: i18n('label_null-data-warning'),
            };
        }
        default: {
            return null;
        }
    }
}
