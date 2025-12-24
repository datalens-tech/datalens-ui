import React from 'react';

import {Flex, HelpMark} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

import {IMPACT_TYPE_OPTION_VALUE, LABEL_BY_SCOPE_MAP} from '../constants';

const i18n = I18n.keyset('dash.control-dialog.edit');

export type SelectedTabsOptionProps = {
    isSelectedTabsDisabled?: boolean;
};

export const SelectedTabsOption = ({isSelectedTabsDisabled}: SelectedTabsOptionProps) => {
    return (
        <Flex gap={1}>
            {LABEL_BY_SCOPE_MAP[IMPACT_TYPE_OPTION_VALUE.SELECTED_TABS]}
            {isSelectedTabsDisabled && (
                <HelpMark>{i18n('hint_not-combined-with-group-setting')}</HelpMark>
            )}
        </Flex>
    );
};
