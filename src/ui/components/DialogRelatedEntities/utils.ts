import {I18n} from 'i18n';
import {EntryScope} from 'shared/types';

const i18n = I18n.keyset('component.dialog-related-entities.view');

export const getLabelByScope = (scope: string) => {
    switch (scope) {
        case EntryScope.Dash:
            return i18n('label_scope-dash');
        case EntryScope.Connection:
            return i18n('label_scope-connection');
        case EntryScope.Dataset:
            return i18n('label_scope-dataset');
        case EntryScope.Widget:
            return i18n('label_scope-chart');
        default:
            return i18n('label_scope-other');
    }
};
