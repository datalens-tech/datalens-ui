import {I18n} from 'i18n';
import {EntryScope} from 'shared';

const i18n = I18n.keyset('new-workbooks.empty-table');

export function getText(scope: EntryScope | undefined) {
    let title: string;
    let description = '';

    switch (scope) {
        case EntryScope.Dash: {
            title = i18n('section_empty-scope-dashboard');

            break;
        }
        case EntryScope.Widget: {
            title = i18n('section_empty-scope-widget');

            break;
        }
        case EntryScope.Dataset: {
            title = i18n('section_empty-scope-dataset');

            break;
        }
        case EntryScope.Connection: {
            title = i18n('section_empty-scope-connection');

            break;
        }
        case EntryScope.Report: {
            title = i18n('section_empty-scope-report');

            break;
        }
        default: {
            title = i18n('section_empty-scope-all');
            description = i18n('label_empty-scope-all-description');
        }
    }

    return {title, description};
}
