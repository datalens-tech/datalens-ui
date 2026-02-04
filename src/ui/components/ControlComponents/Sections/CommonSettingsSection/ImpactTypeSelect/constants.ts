import {I18n} from 'i18n';
import type {ImpactType} from 'shared/types';

const i18n = I18n.keyset('dash.control-dialog.edit');

export const IMPACT_TYPE_OPTION_VALUE: Record<string, ImpactType> = {
    ALL_TABS: 'allTabs',
    CURRENT_TAB: 'currentTab',
    AS_GROUP: 'asGroup',
    SELECTED_TABS: 'selectedTabs',
};

export const LABEL_BY_SCOPE_MAP = {
    [IMPACT_TYPE_OPTION_VALUE.ALL_TABS]: i18n('value_all-tabs'),
    [IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB]: i18n('value_current-tab'),
    [IMPACT_TYPE_OPTION_VALUE.AS_GROUP]: i18n('value_as-group'),
    [IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS]: i18n('value_selected-tabs'),
};
