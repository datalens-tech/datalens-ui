import React from 'react';

import {AdaptiveTabsProps, TabItem, TabsSize} from '@gravity-ui/components';
import {useHistory, useLocation} from 'react-router-dom';
import {isMobileView} from 'ui/utils/mobile';

import Tabs from '../Tabs/Tabs';

export interface NavigationTabsProps {
    items: TabItem<{}>[];
    activeTab?: string;
    defaultTab?: string;
    queryParamName?: string;
    onSelectTab?: AdaptiveTabsProps<{}>['onSelectTab'];
    breakpointsConfig: AdaptiveTabsProps<{}>['breakpointsConfig'];
    size?: TabsSize;
}

const getTabRoute = (pathname: string, search: string, queryParamName: string, tabId?: string) => {
    const searchParams = new URLSearchParams(search);

    if (tabId) {
        searchParams.set(queryParamName, tabId);
    } else {
        searchParams.delete(queryParamName);
    }

    return {
        pathname,
        search: searchParams.toString(),
    };
};

export const NavigationTabs: React.FC<NavigationTabsProps> = ({
    items,
    activeTab,
    defaultTab,
    queryParamName = 'tab',
    onSelectTab,
    ...restProps
}) => {
    const {pathname, search} = useLocation();
    const history = useHistory();

    const currentTab = React.useMemo(() => {
        if (activeTab) {
            return activeTab;
        }

        const tabFromQuery = new URLSearchParams(search).get(queryParamName);

        if (tabFromQuery) {
            const isTabExist = Boolean(items.find((tab) => tab.id === tabFromQuery));

            if (isTabExist) {
                return tabFromQuery;
            }
        }

        if (!items.length) {
            return undefined;
        }

        return defaultTab || items[0].id;
    }, [activeTab, search, defaultTab, items, queryParamName]);

    React.useEffect(() => {
        const tabFromQuery = new URLSearchParams(search).get(queryParamName);

        if (tabFromQuery === currentTab) {
            return;
        }

        const currentTabRouteParams = getTabRoute(pathname, search, queryParamName, currentTab);
        history.replace(currentTabRouteParams);
    }, [currentTab, pathname, search, history, queryParamName]);

    const handleSelectTab = React.useCallback(
        (tabId: string, event?: React.MouseEvent) => {
            if (!event) {
                return;
            }

            if (tabId === currentTab) {
                event?.preventDefault();
                return;
            }

            if (onSelectTab) {
                onSelectTab?.(tabId, event);
            } else {
                const currentTabRouteParams = getTabRoute(pathname, search, queryParamName, tabId);
                history.replace(currentTabRouteParams);
            }
        },

        [onSelectTab, currentTab, history, queryParamName, pathname, search],
    );

    return (
        <Tabs
            activeTab={currentTab}
            items={items}
            onSelectTab={handleSelectTab}
            disableOpacity={!isMobileView}
            {...restProps}
        />
    );
};

NavigationTabs.displayName = 'NavigationTabs';
