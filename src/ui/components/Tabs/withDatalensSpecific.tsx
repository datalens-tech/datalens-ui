import React from 'react';

import type {AdaptiveTabsProps, TabsSize} from '@gravity-ui/components';
import {Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useHistory, useLocation} from 'react-router-dom';
import {DatalensTabs} from 'shared/constants/qa/components';
import {DL} from 'ui/constants/common';

import './Tabs.scss';

const b = block('dl-tabs');

const defaultBreakPointsConfig = {
    '400': 35,
    '1100': 32,
    '1200': 29,
    '1400': 27,
};

const breakpointsWithoutCollapse = {
    '0': 100,
};

const handleTabLinkClick = (event: React.MouseEvent) => {
    if (!event.metaKey) {
        // if the click is with command clamped, then the user wants the tab to open in a new window
        event.preventDefault();
    }
};

type TabsWithDatalensSpecificProps<T> = Omit<AdaptiveTabsProps<T>, 'breakpointsConfig'> & {
    size?: TabsSize;
    disableOpacity?: boolean;
    wrapperClassName?: string;
};

function withDatalensSpecific<T>(Component: React.ElementType<AdaptiveTabsProps<T>>) {
    function WithDatalensSpecific(props: TabsWithDatalensSpecificProps<T>) {
        const {size = 'm', disableOpacity, wrapperClassName, ...restProps} = props;

        const history = useHistory();
        const {pathname} = useLocation();

        const breakpointsConfig = DL.IS_MOBILE
            ? breakpointsWithoutCollapse
            : defaultBreakPointsConfig;

        return (
            <div
                className={b(
                    {size, opacity: !disableOpacity, mobile: DL.IS_MOBILE},
                    wrapperClassName,
                )}
            >
                <Component
                    {...restProps}
                    breakpointsConfig={breakpointsConfig}
                    size={size}
                    wrapTo={(item, node) => {
                        const tab = DL.IS_MOBILE ? DatalensTabs.MobileItem : DatalensTabs.Item;
                        const active = item?.id === restProps.activeTab;
                        const qa = item ? tab : DatalensTabs.SwitcherItem;

                        return item?.id ? (
                            <Link
                                onClick={handleTabLinkClick}
                                className={b('tab', {active})}
                                href={history.createHref({pathname, search: `?tab=${item.id}`})}
                                qa={qa}
                            >
                                {node}
                            </Link>
                        ) : (
                            <div data-qa={qa} className={b('tab', {active})}>
                                {node}
                            </div>
                        );
                    }}
                />
            </div>
        );
    }

    return WithDatalensSpecific;
}

export default withDatalensSpecific;
