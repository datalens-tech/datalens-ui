import React from 'react';

import {ActionTooltip} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {ImpactType} from 'shared/types';
import {GlobalSelectorIcon} from 'ui/units/dash/components/GlobalSelectorIcon/GlobalSelectorIcon';

import './TabItemWrapper.scss';

const i18n = I18n.keyset('dash.group-controls-dialog.edit');

const b = block('group-control-sidebar-tab-item-wrapper');

export const TabItemWrapper: React.FC<{isVisible: boolean; impactType?: ImpactType}> = ({
    isVisible,
    impactType,
    children,
}) => {
    return (
        <div className={b({secondary: !isVisible})}>
            <GlobalSelectorIcon withHint impactType={impactType} className={b('global-icon')} />
            {isVisible ? (
                children
            ) : (
                <ActionTooltip title={i18n('label_no-display-on-current-tab')}>
                    <span>{children}</span>
                </ActionTooltip>
            )}
        </div>
    );
};
