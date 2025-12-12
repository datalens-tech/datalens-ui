import React from 'react';

import type {Config, ConfigItem, ConfigLayout, DashKitProps} from '@gravity-ui/dashkit';
import {useSelector} from 'react-redux';

import {DL} from '../../../../../../../constants';
import {getGroupedItems} from '../../../../../modules/helpers';
import {selectCurrentTab} from '../../../../../store/selectors/dashTypedSelectors';

export const useConfig = (): DashKitProps['config'] | null => {
    const tabDataConfig = useSelector(selectCurrentTab);

    const config = React.useMemo(() => {
        if (!tabDataConfig || !DL.IS_MOBILE) {
            return tabDataConfig as DashKitProps['config'] | null;
        }

        const layoutIndex: Record<string, number> = {};
        const sortedItems = getGroupedItems(tabDataConfig.items, tabDataConfig.layout)
            .reduce((list, group) => {
                group.forEach((item) => {
                    layoutIndex[item.id] = item.orderId;
                });
                list.push(...group);
                return list;
            }, [])
            .sort((a, b) => a.orderId - b.orderId);
        const sortedLayout = tabDataConfig.layout.reduce<ConfigLayout[]>((memo, item) => {
            memo[layoutIndex[item.i]] = item;
            return memo;
        }, []);

        const result: DashKitProps['config'] = {
            ...tabDataConfig,
            layout: sortedLayout,
            items: sortedItems as ConfigItem[],
            globalItems: tabDataConfig.globalItems as Config['globalItems'],
        };

        return result;
    }, [tabDataConfig]);

    return config;
};
