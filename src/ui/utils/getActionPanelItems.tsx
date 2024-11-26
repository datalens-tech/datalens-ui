import React from 'react';

import type {ActionPanelItem as DashkitActionPanelItem, ItemDropProps} from '@gravity-ui/dashkit';
import {CopyPlus} from '@gravity-ui/icons';
import {Icon} from '@gravity-ui/uikit';
import {i18n} from 'i18n';
import {DashTabItemType} from 'shared';

import {DIALOG_TYPE} from '../constants/dialogs';
import {registry} from '../registry';
import type {CopiedConfigData} from '../units/dash/modules/helpers';

import {bEditPanelItem} from './getBasicActionPanelItems';

export const TYPES_TO_DIALOGS_MAP = {
    [DashTabItemType.Widget]: DIALOG_TYPE.WIDGET,
    [DashTabItemType.GroupControl]: DIALOG_TYPE.GROUP_CONTROL,
    [DashTabItemType.Control]: DIALOG_TYPE.CONTROL,
    [DashTabItemType.Text]: DIALOG_TYPE.TEXT,
    [DashTabItemType.Title]: DIALOG_TYPE.TITLE,
    [DashTabItemType.Image]: DIALOG_TYPE.IMAGE,
};

export const ITEM_PASTE_ITEM_ID = 'paste';

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
    const {getBasicActionPanelItems} = registry.common.functions.getAll();
    const items = getBasicActionPanelItems();

    if (copiedData) {
        items.push({
            id: ITEM_PASTE_ITEM_ID,
            icon: <Icon data={CopyPlus} />,
            title: i18n('dash.main.view', 'button_edit-panel-paste'),
            className: bEditPanelItem(),
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

    return items.reduce((result, item) => {
        if (filterItem && filterItem(item)) {
            return result;
        } else {
            if (item.id !== ITEM_PASTE_ITEM_ID) {
                // eslint-disable-next-line no-param-reassign
                item.onClick = () =>
                    openDialog(
                        TYPES_TO_DIALOGS_MAP[
                            item.dragProps?.type as keyof typeof TYPES_TO_DIALOGS_MAP
                        ],
                    );
            }

            return [...result, item];
        }
    }, [] as DashkitActionPanelItem[]);
};
