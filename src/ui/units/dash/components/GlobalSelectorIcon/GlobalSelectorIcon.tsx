import React from 'react';

import {Globe, LayoutTabs} from '@gravity-ui/icons';
import {ActionTooltip, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {ScopeType} from 'shared/types/dash';

import './GlobalSelectorIcon.scss';

const b = block('global-selector-icon');

type GlobalSelectorIconType = {
    size?: number;
    withHint?: boolean;
    scopeType?: ScopeType;
    className?: string;
};

// const i18n = I18n.keyset('dash.control-dialog.edit');

// TODO (global selectors): Add translations
const i18n = (key: string) => {
    const values: Record<string, string> = {
        'value_all-tabs': 'На всех вкладках',
        'value_selected-tabs': 'Выбранные вкладки',
    };

    return values[key];
};

export const GlobalSelectorIcon = ({
    size = 16,
    withHint,
    scopeType,
    className,
}: GlobalSelectorIconType) => {
    let icon;
    let hintTitle = '';
    if (scopeType === 'all') {
        icon = <Icon data={Globe} size={size} className={b(null, className)} />;
        hintTitle = i18n('value_all-tabs');
    } else if (scopeType === 'selected') {
        icon = <Icon data={LayoutTabs} size={size} className={b(null, className)} />;
        hintTitle = i18n('value_selected-tabs');
    }

    if (icon) {
        const showHint = withHint && hintTitle;
        return showHint ? <ActionTooltip title={hintTitle}>{icon}</ActionTooltip> : icon;
    }

    return null;
};
