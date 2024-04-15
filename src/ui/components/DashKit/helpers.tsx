import {DL} from 'constants/common';

import React from 'react';

import type {ConfigItem, ItemState} from '@gravity-ui/dashkit';
import {MenuItems} from '@gravity-ui/dashkit/helpers';
import {Copy, Pencil, TrashBin} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {DashTabItemControlSourceType, DashTabItemType, Feature, StringParams} from 'shared';
import {DashKitOverlayMenuQa} from 'shared/constants/qa/dash';
import {Utils} from 'ui';

import {getEndpointForNavigation} from '../../libs/DatalensChartkit/modules/navigation';
import URI from '../../libs/DatalensChartkit/modules/uri/uri';

import './DashKit.scss';

const i18n = I18n.keyset('component.dashkit.view');
const b = block('dashkit-plugin-menu');

type TabData = {id: string; chartId: string; params: StringParams; state: ItemState};

const removeEmptyParams = (params: StringParams) => {
    return Object.entries(params).reduce((result, [key, value]) => {
        if (value !== null && value !== undefined) {
            result[key] = value;
        }
        return result;
    }, {} as StringParams);
};

export function getEditLink(configItem: ConfigItem, params: StringParams, state: ItemState) {
    const {type, data} = configItem;

    let entryId: string | undefined;

    if (type === DashTabItemType.Control) {
        const source = data?.source as {chartId?: string} | undefined;
        if (source) {
            entryId = source?.chartId;
        }
    } else {
        const itemTabs = data?.tabs as Array<TabData> | undefined;
        if (itemTabs) {
            const stateTabId: string | undefined = state?.tabId;
            const itemTab = itemTabs.find((iTab) => iTab.id === stateTabId) || itemTabs[0];
            entryId = itemTab.chartId;
        }
    }

    if (!entryId) {
        return null;
    }

    // does not work properly in DEV mode without navigator
    const endpoint = getEndpointForNavigation(
        DL.ENDPOINTS,
        Utils.isEnabledFeature(Feature.UseNavigation),
    );

    const linkParams = removeEmptyParams(params);

    const queryPrams = URI.makeQueryString(linkParams);

    return `${endpoint}/${entryId}${queryPrams}`;
}

export function getDashKitMenu() {
    const isShowNewRelation = Utils.isEnabledFeature(Feature.ShowNewRelations);

    const editMenuItem = {
        id: 'edit',
        title: i18n('label_edit'),
        icon: isShowNewRelation && <Icon data={Pencil} size={16} />,
        handler: (configItem: ConfigItem, params: StringParams, state: ItemState) => {
            const link = getEditLink(configItem, params, state);

            if (link) {
                window.open(link, '_blank');
            }
        },
        visible: (configItem: ConfigItem) => {
            const {type, data} = configItem;

            return (
                type === DashTabItemType.Widget ||
                (type === DashTabItemType.Control &&
                    data?.sourceType === DashTabItemControlSourceType.External)
            );
        },
    };

    return isShowNewRelation
        ? [
              editMenuItem,
              {
                  id: MenuItems.Copy,
                  title: i18n('label_copy'),
                  icon: <Icon data={Copy} size={16} />,
                  qa: DashKitOverlayMenuQa.CopyButton,
              },
              {
                  id: MenuItems.Delete,
                  title: i18n('label_delete'),
                  icon: <Icon data={TrashBin} size={16} />,
                  className: b('item', {danger: true}),
                  qa: DashKitOverlayMenuQa.RemoveButton,
              },
          ]
        : [
              editMenuItem,
              {
                  id: MenuItems.Copy,
                  title: i18n('label_copy'),
                  qa: DashKitOverlayMenuQa.CopyButton,
              },
              {
                  id: MenuItems.Delete,
                  title: i18n('label_delete'),
                  qa: DashKitOverlayMenuQa.RemoveButton,
              },
          ];
}
