import React from 'react';

import type {ActionPanelItem as DashkitActionPanelItem, ItemDropProps} from '@gravity-ui/dashkit';
import {ChartColumn, Code, CopyPlus, Heading, Sliders, TextAlignLeft} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {DashTabItemType, DashboardAddWidgetQa, Feature} from 'shared';
import Utils from 'ui/utils';

import {DIALOG_TYPE} from '../containers/Dialogs/constants';
import type {CopiedConfigData} from '../modules/helpers';

const b = block('dash-body');

export const TYPES_TO_DIALOGS_MAP = {
    [DashTabItemType.Widget]: DIALOG_TYPE.WIDGET,
    [DashTabItemType.GroupControl]: DIALOG_TYPE.GROUP_CONTROL,
    [DashTabItemType.Control]: DIALOG_TYPE.CONTROL,
    [DashTabItemType.Text]: DIALOG_TYPE.TEXT,
    [DashTabItemType.Title]: DIALOG_TYPE.TITLE,
};

export const getActionPanelItems = ({
    copiedData,
    onPasteItem,
    openDialog,
    filterItem,
}: {
    copiedData: CopiedConfigData | null;
    onPasteItem: (item: CopiedConfigData) => void;
    openDialog: (
        dialogType: 'tabs' | 'connections' | 'settings' | 'selectState' | 'edit' | DashTabItemType,
        dragOperationProps?: ItemDropProps | undefined,
    ) => void;
    filterItem?: (item: DashkitActionPanelItem) => boolean;
}) => {
    let items: DashkitActionPanelItem[] = [
        {
            id: 'chart',
            icon: <Icon data={ChartColumn} />,
            title: i18n('dash.main.view', 'button_edit-panel-chart'),
            className: b('edit-panel-item'),
            qa: DashboardAddWidgetQa.AddWidget,
            dragProps: {
                type: DashTabItemType.Widget,
            },
        },
        {
            id: 'selector',
            icon: <Icon data={Utils.isEnabledFeature(Feature.GroupControls) ? Code : Sliders} />,
            title: Utils.isEnabledFeature(Feature.GroupControls)
                ? i18n('dash.main.view', 'button_edit-panel-editor-selector')
                : i18n('dash.main.view', 'button_edit-panel-selector'),
            className: b('edit-panel-item'),
            qa: DashboardAddWidgetQa.AddControl,
            dragProps: {
                type: DashTabItemType.Control,
            },
        },
        {
            id: 'text',
            icon: <Icon data={TextAlignLeft} />,
            title: i18n('dash.main.view', 'button_edit-panel-text'),
            className: b('edit-panel-item'),
            qa: DashboardAddWidgetQa.AddText,
            dragProps: {
                type: DashTabItemType.Text,
            },
        },
        {
            id: 'header',
            icon: <Icon data={Heading} />,
            title: i18n('dash.main.view', 'button_edit-panel-title'),
            className: b('edit-panel-item'),
            qa: DashboardAddWidgetQa.AddTitle,
            dragProps: {
                type: DashTabItemType.Title,
            },
        },
    ];

    if (copiedData) {
        items.push({
            id: 'paste',
            icon: <Icon data={CopyPlus} />,
            title: i18n('dash.main.view', 'button_edit-panel-paste'),
            className: b('edit-panel-item'),
            onClick: () => {
                onPasteItem(copiedData);
            },
            dragProps: {
                type: copiedData.type,
                layout: copiedData.layout,
                extra: copiedData,
            },
        });
    }

    if (Utils.isEnabledFeature(Feature.GroupControls)) {
        items.splice(1, 0, {
            id: 'group-selector',
            icon: <Icon data={Sliders} />,
            title: i18n('dash.main.view', 'button_edit-panel-selector'),
            className: b('edit-panel-item'),
            qa: DashboardAddWidgetQa.AddGroupControl,
            dragProps: {
                type: DashTabItemType.GroupControl,
            },
        });
    }

    if (filterItem) {
        items = items.filter(filterItem);
    }

    return items.map((item) => {
        if (item.dragProps?.type && !item.onClick) {
            item.onClick = () =>
                openDialog(
                    TYPES_TO_DIALOGS_MAP[item.dragProps?.type as keyof typeof TYPES_TO_DIALOGS_MAP],
                );
        }

        return item;
    });
};
