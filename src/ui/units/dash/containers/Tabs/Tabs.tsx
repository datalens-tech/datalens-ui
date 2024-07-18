import React from 'react';

import type {TabItem} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import type {ResolveThunks} from 'react-redux';
import {connect} from 'react-redux';
import {useHistory, useLocation} from 'react-router-dom';
import {DashTabsQA} from 'shared';
import type {DatalensGlobalState} from 'ui';
import DataLensTabs from 'ui/components/Tabs/Tabs';
import {DL} from 'ui/constants/common';
import {isEmbeddedEntry} from 'ui/utils/embedded';
import {MOBILE_SIZE} from 'ui/utils/mobile';

import {appendSearchQuery, getHashStateParam} from '../../modules/helpers';
import {setPageTab} from '../../store/actions/dashTyped';
import {
    selectCurrentTabId,
    selectHashStates,
    selectTabId,
    selectTabs,
} from '../../store/selectors/dashTypedSelectors';

import './Tabs.scss';

const b = block('dash-tabs');

type StateProps = ReturnType<typeof mapStateToProps>;

type DispatchProps = ResolveThunks<typeof mapDispatchToProps>;

type OwnPops<T> = {
    tabs: TabItem<T>[];
};

type TabsProps<T> = OwnPops<T> & StateProps & DispatchProps;

const TABS_VIRTUALIZATION_SELECT_LIMIT = 70;

function TabsComponent<T>(props: TabsProps<T>) {
    const location = useLocation();
    const history = useHistory();

    const size = DL.IS_MOBILE ? MOBILE_SIZE.TABS : 'l';

    return props.tabs.length > 1 ? (
        <div className={b()} data-qa={DashTabsQA.Root}>
            <DataLensTabs
                size={size}
                activeTab={props.currentTabId || undefined}
                items={props.tabs.map(({id, title}) => ({id, title}))}
                onSelectTab={(tabId, event) => {
                    // clicking on the tab with the meta-key pressed - opening the tab in a new window, and not switching to it
                    if (event && event.metaKey) {
                        return;
                    }

                    props.setPageTab(tabId);

                    const searchParams = {
                        tab: tabId,
                        state: getHashStateParam(props.hashStates, tabId),
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

const mapStateToProps = (state: DatalensGlobalState) => ({
    tabs: selectTabs(state),
    tabId: selectTabId(state),
    currentTabId: selectCurrentTabId(state),
    hashStates: selectHashStates(state),
});

const mapDispatchToProps = {
    setPageTab,
};

export const Tabs = connect(mapStateToProps, mapDispatchToProps)(TabsComponent);
