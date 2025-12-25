import React from 'react';

import {Globe, LayoutTabs} from '@gravity-ui/icons';
import {ActionTooltip, Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {ImpactType} from 'shared/types/dash';

import './GlobalSelectorIcon.scss';

const b = block('global-selector-icon');

type GlobalSelectorIconType = {
    size?: number;
    withHint?: boolean;
    impactType?: ImpactType;
    className?: string;
};

const i18n = I18n.keyset('dash.control-dialog.edit');

export const GlobalSelectorIcon = ({
    size = 16,
    withHint,
    impactType,
    className,
}: GlobalSelectorIconType) => {
    let icon;
    let hintTitle = '';
    if (impactType === 'allTabs') {
        icon = <Icon data={Globe} size={size} className={b(null, className)} />;
        hintTitle = i18n('value_all-tabs');
    } else if (impactType === 'selectedTabs') {
        icon = <Icon data={LayoutTabs} size={size} className={b(null, className)} />;
        hintTitle = i18n('value_selected-tabs');
    }

    if (icon) {
        const showHint = withHint && hintTitle;
        return showHint ? <ActionTooltip title={hintTitle}>{icon}</ActionTooltip> : icon;
    }

    return null;
};
