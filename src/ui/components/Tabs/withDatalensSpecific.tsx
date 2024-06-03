import React from 'react';

import type {AdaptiveTabsProps, TabsSize} from '@gravity-ui/components';
import {Link} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {isMobileView} from 'ui/utils/mobile';

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
};

function withDatalensSpecific<T>(Component: React.ElementType<AdaptiveTabsProps<T>>) {
    function WithDatalensSpecific(props: TabsWithDatalensSpecificProps<T>) {
        const {size = 'm', ...restProps} = props;

        const breakpointsConfig = isMobileView
            ? breakpointsWithoutCollapse
            : defaultBreakPointsConfig;

        return (
            <div className={b({size})}>
                <Component
                    {...restProps}
                    breakpointsConfig={breakpointsConfig}
                    size={size}
                    wrapTo={(item, node) => {
                        const isActive = item?.id === restProps.activeTab;

                        return item?.id ? (
                            <Link
                                onClick={handleTabLinkClick}
                                className={b('tab', {active: isActive})}
                                href={`${window.location.pathname}?tab=${item.id}`}
                            >
                                {node}
                            </Link>
                        ) : (
                            <React.Fragment>{node}</React.Fragment>
                        );
                    }}
                />
            </div>
        );
    }

    return WithDatalensSpecific;
}

export default withDatalensSpecific;
