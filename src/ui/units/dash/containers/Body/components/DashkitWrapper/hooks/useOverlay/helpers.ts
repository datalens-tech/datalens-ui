import type {ConfigItem} from '@gravity-ui/dashkit';
import {Gear} from '@gravity-ui/icons';
import type {IconProps} from '@gravity-ui/uikit';
import type {DashTabItem, DashTabItemControl, DashTabItemGroupControl} from 'shared/types';
import {DashTabItemType} from 'shared/types';
import {isItemGlobal} from 'ui/units/dash/utils/selectors';

import {getGearGlobalIcon} from './getGearGlobalIcon';

export const getGlobalIcon = (dashItem: DashTabItem): IconProps['data'] => {
    let impactType;

    if (
        dashItem.type === DashTabItemType.Control ||
        dashItem.type === DashTabItemType.GroupControl
    ) {
        impactType = dashItem.data.impactType;

        if (dashItem.type === DashTabItemType.GroupControl && dashItem.data.group.length === 1) {
            impactType = dashItem.data.group[0].impactType;
        }
    }

    if (impactType === 'selectedTabs') {
        return getGearGlobalIcon({type: 'selectedTabs'});
    }

    if (impactType === 'allTabs') {
        return getGearGlobalIcon({type: 'allTabs'});
    }

    return Gear;
};

export const isConfigItemGlobal = (item: ConfigItem) => {
    if (item.type !== DashTabItemType.Control && item.type !== DashTabItemType.GroupControl) {
        return false;
    }

    return isItemGlobal(item as unknown as DashTabItemControl | DashTabItemGroupControl);
};
