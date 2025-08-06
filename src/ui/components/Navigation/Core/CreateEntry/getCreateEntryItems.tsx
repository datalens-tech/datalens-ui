import React from 'react';

import type {DropdownMenuItem, DropdownMenuItemMixed} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';

import {registry} from '../../../../registry';
import {EntityIcon} from '../../../EntityIcon/EntityIcon';
import {PLACE} from '../../constants';

import {type CreateEntryProps, CreateMenuValue} from './CreateEntry';

import iconFolder from '../../../../assets/icons/folder.svg';

const b = block('dl-navigation-create-entry');
const i18n = I18n.keyset('component.navigation.view');

const Title: React.FC<{title: string; className: string}> = ({title, className}) => (
    <div className={className}>{title}</div>
);

export const getCreateEntryItems = ({onClick, place, isOnlyCollectionsMode}: CreateEntryProps) => {
    const {getNavigationCreatableEntriesConfig} = registry.common.functions.getAll();

    const creatableEntriesConfig = getNavigationCreatableEntriesConfig();

    const menuItems: DropdownMenuItemMixed<() => void>[] = [];
    const menuChartItems: DropdownMenuItem<() => void>[] = [];
    const menuBoardItems: DropdownMenuItem<() => void>[] = [];
    const menuOtherItems: DropdownMenuItem<() => void>[] = [];

    creatableEntriesConfig.forEach((entryConfig) => {
        if (entryConfig.condition && entryConfig.condition() === false) {
            return;
        }

        let targetMenu;
        if (entryConfig.submenu === 'charts') {
            targetMenu = menuChartItems;
        } else if (entryConfig.submenu === 'boards') {
            targetMenu = menuBoardItems;
        } else if (entryConfig.submenu === 'other') {
            targetMenu = menuOtherItems;
        } else {
            targetMenu = menuItems;
        }

        targetMenu.push({
            action: () => onClick(entryConfig.value),
            icon: <EntityIcon type={entryConfig.type} iconData={entryConfig.icon} />,
            text: <Title className={b('item-title')} title={entryConfig.text} />,
            qa: entryConfig.qa,
        });
    });

    // If current menu contains Charts only then return Charts creation subset
    if (place === PLACE.WIDGETS) {
        return menuChartItems;
    }

    if (isOnlyCollectionsMode === false) {
        menuItems.push({
            action: () => onClick(CreateMenuValue.Folder),
            icon: <EntityIcon type="folder" iconData={iconFolder} iconSize={18} />,
            text: <Title className={b('item-title')} title={i18n('value_create-folder')} />,
        });
    }

    menuItems.push(menuChartItems);

    if (menuBoardItems.length > 0) {
        menuItems.push(menuBoardItems);
    }

    menuItems.push(menuOtherItems);

    return menuItems;
};
