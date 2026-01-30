import {I18n} from 'i18n';
import {PLACE} from 'shared';

const i18n = I18n.keyset('component.navigation.view');

export const getTitleByPlace = (scope: string) => {
    switch (scope) {
        case PLACE.ROOT:
            return i18n('label_empty-folder');
        case PLACE.FAVORITES:
            return i18n('label_empty-favorites');
        case PLACE.CONNECTIONS:
            return i18n('label_empty-connections');
        case PLACE.DATASETS:
            return i18n('label_empty-datasets');
        case PLACE.WIDGETS:
            return i18n('label_empty-widgets');
        case PLACE.DASHBOARDS:
            return i18n('label_empty-dashboards');
        case PLACE.REPORTS:
            return i18n('label_empty-reports');
        default:
            return i18n('label_empty');
    }
};

export const getDescriptionByPlace = (scope: string) => {
    switch (scope) {
        case PLACE.CONNECTIONS:
            return i18n('label-description_empty-connections');
        case PLACE.DATASETS:
            return i18n('label-description_empty-datasets');
        case PLACE.WIDGETS:
            return i18n('label-description_empty-widgets');
        case PLACE.DASHBOARDS:
            return i18n('label-description_empty-dashboards');
        case PLACE.REPORTS:
            return i18n('label-description_empty-reports');
        default:
            return '';
    }
};
