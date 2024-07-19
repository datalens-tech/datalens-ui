import type {Permissions} from 'shared';

import {getEntryContextMenu} from '../constants';
import type {ContextMenuParams} from '../types';

const checkPermissions = (
    actual?: Permissions,
    etalon?: Permissions,
    strictCheck = false,
): boolean => {
    if (actual === undefined || actual === null || etalon == undefined) return !strictCheck;

    if (actual.admin && etalon.admin) return true;
    if (actual.edit && etalon.edit) return true;
    if (actual.read && etalon.read) return true;
    if (actual.execute && etalon.execute) return true;

    return false;
};

export const getFilteredEntryContextMenu = ({
    entry,
    isEditMode,
    showSpecificItems,
    isLimitedView,
    place,
}: ContextMenuParams) => {
    const isOnEditMode = isEditMode === 'edit';

    return getEntryContextMenu().filter((menuItem) => {
        if (!menuItem) {
            return false;
        }

        const menuPermission: Permissions = (
            entry && typeof menuItem.permissions === 'function'
                ? menuItem.permissions(entry)
                : menuItem.permissions
        ) as Permissions;

        return (
            entry &&
            // check availability
            menuItem.enable(entry) &&
            // check the scope/object from which we call the menu
            entry.scope &&
            menuItem.scopes.includes(entry.scope) &&
            // check the match of the menu item for accessibility/prohibition in editing mode
            (menuItem.isOnEditMode === undefined || menuItem.isOnEditMode === isOnEditMode) &&
            // check the match of the menu item to display specific
            (menuItem.isSpecific === undefined || menuItem.isSpecific === showSpecificItems) &&
            // check place in menuitem
            (menuItem.place === undefined || menuItem.place === place) &&
            // check rights
            (menuItem.permissions === undefined ||
                checkPermissions(
                    entry.permissions,
                    menuPermission,
                    menuItem.isStrictPermissions,
                )) &&
            // check corner states
            (menuItem.isVisible === undefined ||
                menuItem.isVisible({entry, showSpecificItems, isEditMode, isLimitedView, place}))
        );
    });
};
