import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import {DashTabsQA} from 'shared';
import DataLensTabs from 'ui/components/Tabs/Tabs';
import {DL} from 'ui/constants/common';
import {isEmbeddedEntry} from 'ui/utils/embedded';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import {appendSearchQuery} from '../../modules/helpers';
import type {DashDispatch} from '../../store/actions';
import {setPageTab} from '../../store/actions/dashTyped';
import {selectCurrentTabId, selectTabs} from '../../store/selectors/dashTypedSelectors';

import './Tabs.scss';

const b = block('dash-tabs');

type TabsProps = {
    className?: string;
};

const TABS_VIRTUALIZATION_SELECT_LIMIT = 70;

export function Tabs(props: TabsProps) {
    const location = useLocation();
    const history = useHistory();
    const dispatch = useDispatch<DashDispatch>();

    const tabs = useSelector(selectTabs);
    const currentTabId = useSelector(selectCurrentTabId);

    const size = DL.IS_MOBILE ? MOBILE_SIZE.TABS : 'l';

    return tabs.length > 1 ? (
        <div className={b(null, props.className)} data-qa={DashTabsQA.Root}>
            <DataLensTabs
                size={size}
                activeTab={currentTabId || undefined}
                items={tabs.map(({id, title}) => ({id, title}))}
                onSelectTab={async (tabId, event) => {
                    // clicking on the tab with the meta-key pressed - opening the tab in a new window, and not switching to it
                    if (event && event.metaKey) {
                        return;
                    }

                    const tabHashState = await dispatch(setPageTab(tabId));

                    const searchParams = {
                        tab: tabId,
                        state: tabHashState?.hash ?? '',
                    };

                    history.push({
                        ...location,
                        search: appendSearchQuery(location.search, searchParams),
                        hash: isEmbeddedEntry() ? location.hash : '',
                    });
                }}
                moreControlProps={{virtualizationThreshold: TABS_VIRTUALIZATION_SELECT_LIMIT}}
            />
        </div>
    ) : null;
}
