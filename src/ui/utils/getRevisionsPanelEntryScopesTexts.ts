import {I18n} from 'i18n';

const i18n = I18n.keyset('component.revisions-panel.view');

const ENTRY_SCOPE_TEXTS = {
    dataset: {
        scopeText: i18n('label_dataset'),
        panelText: i18n('label_of-dataset'),
    },
    dash: {
        scopeText: i18n('label_dash'),
        panelText: i18n('label_of-dash'),
    },
    widget: {
        scopeText: i18n('label_chart'),
        panelText: i18n('label_of-chart'),
    },
    editor: {
        scopeText: i18n('label_editor'),
        panelText: i18n('label_of-editor'),
    },
};

export const getRevisionsPanelEntryScopesTexts = () => ENTRY_SCOPE_TEXTS;
