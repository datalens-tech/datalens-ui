import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import type {DashTab, ImpactType} from 'shared/types';

import {IMPACT_TYPE_OPTION_VALUE, LABEL_BY_SCOPE_MAP} from '../constants';

import '../ImpactTypeSelect.scss';

const b = block('impact-type-select');

const CurrentTabOptionComponent = ({
    currentTabTitle,
    impactTabsIds,
    tabs,
    currentImpactType,
    isGlobal,
}: {
    currentTabTitle?: string;
    impactTabsIds: string[];
    tabs: DashTab[];
    currentImpactType: ImpactType;
    isGlobal?: boolean;
}) => {
    const optionTabTitle = React.useMemo(() => {
        const titleFromTab = currentTabTitle || '';
        if (impactTabsIds.length !== 1 || currentImpactType !== 'currentTab' || !isGlobal) {
            return titleFromTab;
        }

        const optionTab = tabs.find((tab) => tab.id === impactTabsIds[0]);
        const titleFromImpactTabs = optionTab?.title || '';

        return titleFromImpactTabs;
    }, [currentImpactType, currentTabTitle, impactTabsIds, isGlobal, tabs]);

    return (
        <Flex gap={2} className={b('current-tab')}>
            <span>{LABEL_BY_SCOPE_MAP[IMPACT_TYPE_OPTION_VALUE.CURRENT_TAB]}</span>
            <span className={b('tab-hint')}>{optionTabTitle}</span>
        </Flex>
    );
};

export const CurrentTabOption = React.memo(CurrentTabOptionComponent);
