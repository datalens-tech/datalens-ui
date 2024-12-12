import React from 'react';

import type {ActionPanelItem} from '@gravity-ui/dashkit';
import {ChartColumn, Heading, Picture, Sliders, TextAlignLeft} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {DashTabItemType, DashboardAddWidgetQa} from 'shared';
import type {GetBasicActionPanelItems} from 'ui/registry/units/common/types/functions/getBasicActionPanelItems';

export const bEditPanelItem = block('edit-panel-item');

type DashkitBasicActionPanelItemKey =
    | DashTabItemType.GroupControl
    | DashTabItemType.Image
    | DashTabItemType.Text
    | DashTabItemType.Title
    | DashTabItemType.Widget;

type DashkitBasicActionPanelItem<T extends string = DashkitBasicActionPanelItemKey> = Record<
    T,
    ActionPanelItem
>;

export const DASHKIT_BASIC_ACTION_PANEL_ITEM: DashkitBasicActionPanelItem = {
    [DashTabItemType.GroupControl]: {
        id: 'group-selector',
        icon: <Icon data={Sliders} />,
        get title() {
            return i18n('dash.main.view', 'button_edit-panel-selector');
        },
        className: bEditPanelItem(),
        qa: DashboardAddWidgetQa.AddGroupControl,
        dragProps: {
            type: DashTabItemType.GroupControl,
        },
    },
    [DashTabItemType.Image]: {
        id: DashTabItemType.Image,
        icon: <Icon data={Picture} />,
        get title() {
            return i18n('dash.main.view', 'button_edit-panel-image');
        },
        className: bEditPanelItem(),
        qa: DashboardAddWidgetQa.AddImage,
        dragProps: {
            type: DashTabItemType.Image,
        },
    },
    [DashTabItemType.Text]: {
        id: 'text',
        icon: <Icon data={TextAlignLeft} />,
        get title() {
            return i18n('dash.main.view', 'button_edit-panel-text');
        },
        className: bEditPanelItem(),
        qa: DashboardAddWidgetQa.AddText,
        dragProps: {
            type: DashTabItemType.Text,
        },
    },
    [DashTabItemType.Title]: {
        id: 'header',
        icon: <Icon data={Heading} />,
        get title() {
            return i18n('dash.main.view', 'button_edit-panel-title');
        },
        className: bEditPanelItem(),
        qa: DashboardAddWidgetQa.AddTitle,
        dragProps: {
            type: DashTabItemType.Title,
        },
    },
    [DashTabItemType.Widget]: {
        id: 'chart',
        icon: <Icon data={ChartColumn} />,
        get title() {
            return i18n('dash.main.view', 'button_edit-panel-chart');
        },
        className: bEditPanelItem(),
        qa: DashboardAddWidgetQa.AddWidget,
        dragProps: {
            type: DashTabItemType.Widget,
        },
    },
};

export const getBasicActionPanelItems: GetBasicActionPanelItems = () => {
    return [
        DASHKIT_BASIC_ACTION_PANEL_ITEM[DashTabItemType.Widget],
        DASHKIT_BASIC_ACTION_PANEL_ITEM[DashTabItemType.GroupControl],
        DASHKIT_BASIC_ACTION_PANEL_ITEM[DashTabItemType.Text],
        DASHKIT_BASIC_ACTION_PANEL_ITEM[DashTabItemType.Title],
    ];
};
