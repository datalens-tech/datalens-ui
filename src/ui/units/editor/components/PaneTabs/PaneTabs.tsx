import React from 'react';

import {AdaptiveTabs} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {EditorPaneQA} from 'shared';
import {DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG} from 'ui/constants/misc';

import './PaneTabs.scss';

const b = block('pane-tabs');

const breakpointsConfig = Object.assign({'150': 40}, DL_ADAPTIVE_TABS_BREAK_POINT_CONFIG);

interface Props {
    paneId: string;
    tabs: {
        id: string;
        name: string;
    }[];
    currentTabId: string;
    onSelectTab: (payload: {paneId: string; tabId: string}) => void;
    className?: string;
}

const getQa = (tabId: string) => {
    switch (tabId) {
        case 'params':
            return EditorPaneQA.ParamsTab;
        default:
            return undefined;
    }
};

const PaneTabs: React.FC<Props> = ({paneId, tabs, currentTabId, onSelectTab, className}) => {
    return (
        <div className={b(null, className)}>
            <AdaptiveTabs
                items={tabs.map(({id, name}) => ({
                    id,
                    title: name,
                }))}
                activeTab={currentTabId}
                onSelectTab={(tabId) => onSelectTab({paneId, tabId})}
                breakpointsConfig={breakpointsConfig}
                wrapTo={(tab, node) => {
                    const isActive = tab?.id === currentTabId;

                    return tab?.id ? (
                        <div className={b('tab', {active: isActive})} data-qa={getQa(tab.id)}>
                            {node}
                        </div>
                    ) : (
                        <React.Fragment>{node}</React.Fragment>
                    );
                }}
            />
        </div>
    );
};

export default PaneTabs;
