import React from 'react';

import {Globe, LayoutTabs} from '@gravity-ui/icons';
import {ActionTooltip, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {TABS_SCOPE_SELECT_VALUE} from 'ui/components/ControlComponents/Sections/CommonSettingsSection/TabsScopeSelect/constants';

import {TABS_SCOPE_ALL} from '../../modules/constants';
import type {TabsScope} from '../../typings/selectors';

import './GlobalSelectorIcon.scss';

const b = block('global-selector-icon');

type GlobalSelectorIconType = {
    size?: number;
    withHint?: boolean;
    tabsScope?: TabsScope;
    className?: string;
};

export const GlobalSelectorIcon = ({
    size = 16,
    withHint,
    tabsScope,
    className,
}: GlobalSelectorIconType) => {
    let icon;
    let hintTitle = '';
    if (tabsScope === TABS_SCOPE_ALL) {
        icon = <Icon data={Globe} size={size} className={b(null, className)} />;
        hintTitle = 'На всех вкладках';
    } else if (Array.isArray(tabsScope) || tabsScope === TABS_SCOPE_SELECT_VALUE.SELECTED_TABS) {
        icon = <Icon data={LayoutTabs} size={size} className={b(null, className)} />;
        hintTitle = 'На выбранных вкладках';
    }

    if (icon) {
        const showHint = withHint && hintTitle;
        return showHint ? <ActionTooltip title={hintTitle}>{icon}</ActionTooltip> : icon;
    }

    return null;
};
