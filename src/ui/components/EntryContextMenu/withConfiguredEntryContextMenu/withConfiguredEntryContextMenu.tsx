import React from 'react';

import {Icon} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {Feature} from 'shared';
import type {GetEntryResponse} from 'shared/schema';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import type {EntryContextMenuNestedProps, MenuClickHandler} from '../EntryContextMenu';
import type EntryContextMenuBase from '../EntryContextMenuBase/EntryContextMenuBase';
import {ENTRY_CONTEXT_MENU_ACTION} from '../constants';
import type {EntryContextMenuItem, EntryContextMenuItems} from '../helpers';
import {getGroupedMenu} from '../helpers';
import type {ContextMenuParams} from '../types';

import {getFilteredEntryContextMenu} from './helpers';

import '../EntryContextMenuBase/EntryContextMenuBase.scss';

const i18n = I18n.keyset('component.entry-context-menu.view');

const OVERRIDE_CONTEXT_MENU = {
    [ENTRY_CONTEXT_MENU_ACTION.DELETE]: {
        theme: 'danger',
    },
};

// eslint-disable-next-line complexity
export const getEntryContextMenuItems = (
    {
        entry,
        isEditMode,
        place,
        showSpecificItems = false,
        isLimitedView = false,
    } = {} as ContextMenuParams,
): EntryContextMenuItems => {
    const entryContextMenuItems = getFilteredEntryContextMenu({
        entry,
        isEditMode,
        showSpecificItems,
        isLimitedView,
        place,
    }).map(
        (menuItem) =>
            ({
                icon: <Icon size={16} data={menuItem.icon} />,
                text: i18n(menuItem.text),
                action: menuItem.action,
                id: menuItem.id,
                qa: menuItem.qa,
                ...(OVERRIDE_CONTEXT_MENU[menuItem.id] || {}),
            }) as EntryContextMenuItem,
    );

    return entryContextMenuItems;
};

export const withConfiguredEntryContextMenu = (
    Component: typeof EntryContextMenuBase,
    itemsPropName = 'items',
) =>
    function WithConfiguredEntryContextMenu(
        props: EntryContextMenuNestedProps &
            ContextMenuParams & {
                onMenuClick: MenuClickHandler<GetEntryResponse>;
            },
    ) {
        const resultProps = {
            ...props,
            [itemsPropName]:
                props.entry && props.entry.fake
                    ? getGroupedMenu(props.additionalItems, {
                          type: 'entry',
                          isFlat: isEnabledFeature(Feature.MenuItemsFlatView),
                      })
                    : getGroupedMenu(
                          getEntryContextMenuItems({
                              entry: props.entry, // eslint-disable-line react/prop-types
                              isEditMode: props.isEditMode,
                              showSpecificItems: props.showSpecificItems,
                              isLimitedView: props.isLimitedView,
                          }).concat(props.additionalItems),
                          {
                              type: 'entry',
                              isFlat: isEnabledFeature(Feature.MenuItemsFlatView),
                          },
                      ),
        };
        return <Component {...resultProps} />;
    };
