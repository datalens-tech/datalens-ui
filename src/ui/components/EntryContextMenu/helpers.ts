import type React from 'react';

import type {IconData} from '@gravity-ui/uikit';
import {registry} from 'ui/registry';
import type {DialogShareProps} from 'ui/registry/units/common/types/components/DialogShare';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';
import Utils from 'ui/utils/utils';

import type {EntryScope} from '../../../shared';
import {Feature, MenuItemsIds, getEntryNameByKey} from '../../../shared';
import type {GetEntryResponse} from '../../../shared/schema';
import {DL, URL_OPTIONS} from '../../constants';
import navigateHelper from '../../libs/navigateHelper';
import history from '../../utils/history';
import type {EntryDialogues} from '../EntryDialogues';
import {EntryDialogName, EntryDialogResolveStatus} from '../EntryDialogues';

import type {MenuEntry} from './types';

export type EntryDialoguesRef = React.RefObject<EntryDialogues>;

export async function renameEntry(entryDialoguesRef: EntryDialoguesRef, entry: MenuEntry) {
    if (entryDialoguesRef.current) {
        const response = await entryDialoguesRef.current.open({
            dialog: EntryDialogName.Rename,
            dialogProps: {
                entryId: entry.entryId,
                initName: entry.name || getEntryNameByKey({key: entry.key, index: -1}),
            },
        });

        if (response.status === EntryDialogResolveStatus.Success) {
            const setEntryKey = registry.common.functions.get('setEntryKey');
            const entryData = response.data ? response.data[0] : null;
            if (entryData) {
                setEntryKey(entryData);
            } else {
                window.location.reload();
            }
        }
    }
}

export async function moveEntry(entryDialoguesRef: EntryDialoguesRef, entry: MenuEntry) {
    if (entryDialoguesRef.current) {
        const response = await entryDialoguesRef.current.open({
            dialog: EntryDialogName.Move,
            dialogProps: {
                entryId: entry.entryId,
                initDestination: Utils.getPathBefore({path: entry.key}),
                inactiveEntryKeys: entry.scope === 'folder' ? [entry.key] : undefined,
            },
        });
        if (response.status === EntryDialogResolveStatus.Success) {
            const setEntryKey = registry.common.functions.get('setEntryKey');
            const entryData = response.data ? response.data.result[0] : null;
            if (entryData) {
                setEntryKey({...entryData, withRouting: false});
            } else {
                window.location.reload();
            }
        }
    }
}

export async function copyEntry(entryDialoguesRef: EntryDialoguesRef, entry: MenuEntry) {
    if (entryDialoguesRef.current) {
        const response = await entryDialoguesRef.current.open({
            dialog: EntryDialogName.Copy,
            dialogProps: {
                entryId: entry.entryId,
                workbookId: entry.workbookId,
                scope: entry.scope,
                initDestination: Utils.getPathBefore({path: entry.key}),
                initName: Utils.getEntryNameFromKey(entry.key, true),
            },
        });
        if (response.status === EntryDialogResolveStatus.Success && response.data) {
            // browser blocked not trusted event (async)
            // https://www.w3.org/TR/DOM-Level-3-Events/#trusted-events
            navigateHelper.open(response.data);
        }
    }
}

export async function deleteEntry(entryDialoguesRef: EntryDialoguesRef, entry: MenuEntry) {
    if (entryDialoguesRef.current) {
        const response = await entryDialoguesRef.current.open({
            dialog: EntryDialogName.Delete,
            dialogProps: {
                entry,
            },
        });
        if (response.status === EntryDialogResolveStatus.Success) {
            const pathname = navigateHelper.getRedirectLocation(entry);

            history.replace({
                ...history.location,
                pathname,
            });
        }
    }
}

export async function accessEntry(entryDialoguesRef: EntryDialoguesRef, entry: GetEntryResponse) {
    if (entryDialoguesRef.current) {
        const hasEditPermissions = entry.permissions?.edit || entry.permissions?.admin;
        if (entry?.data?.accessDescription && !hasEditPermissions) {
            await entryDialoguesRef.current.open({
                dialog: EntryDialogName.AccessDescription,
                dialogProps: {
                    accessDescription: entry.data.accessDescription as string,
                },
            });
            return;
        }

        await entryDialoguesRef.current.open({
            dialog: EntryDialogName.Access,
            dialogProps: {
                entry,
            },
        });
    }
}

export async function migrateToWorkbookEntry(
    entryDialoguesRef: EntryDialoguesRef,
    entry: GetEntryResponse,
) {
    if (entryDialoguesRef.current) {
        await entryDialoguesRef.current.open({
            dialog: EntryDialogName.MigrateToWorkbook,
            dialogProps: {
                entryId: entry.entryId,
            },
        });
    }
}

export async function showRelatedEntities(
    entryDialoguesRef: EntryDialoguesRef,
    entry: GetEntryResponse,
) {
    if (entryDialoguesRef.current) {
        await entryDialoguesRef.current.open({
            dialog: EntryDialogName.ShowRelatedEntities,
            dialogProps: {
                entry,
            },
        });
    }
}

export async function showShareDialog(
    entryDialoguesRef: EntryDialoguesRef,
    entry: GetEntryResponse,
) {
    if (entryDialoguesRef.current) {
        const dialogProps: DialogShareProps = {
            onClose: () => {},
            withSelectors: true,
            propsData: {
                id: entry.entryId,
            },
        };

        if (DL.USER.isFederationUser) {
            dialogProps.withFederation = true;
        }

        if (isEnabledFeature(Feature.EnableEmbedsInDialogShare)) {
            dialogProps.initialParams = {
                [URL_OPTIONS.NO_CONTROLS]: 1,
            };
        } else {
            dialogProps.withEmbedLink = false;
            dialogProps.withCopyAndExitBtn = true;
        }

        await entryDialoguesRef.current.open({
            dialog: EntryDialogName.Share,
            dialogProps,
        });
    }
}

type EntryContextMenuIDTypeBase =
    | 'public'
    | 'rename'
    | 'delete'
    | 'move'
    | 'copy'
    | 'access'
    | 'duplicate'
    | 'edit'
    | 'copy-link'
    | 'tableOfContent'
    | 'settings'
    | 'fullscreen'
    | 'sql'
    | 'sql-to-monitoring'
    | 'embedded'
    | 'materialization'
    | 'revisions'
    | 'migrate-to-workbook'
    | 'show-related-entities';

export type EntryContextMenuIDType<T = unknown> = unknown extends T
    ? EntryContextMenuIDTypeBase
    : EntryContextMenuIDTypeBase | T;

export type MenuGroupConfigIds<T = unknown> = EntryContextMenuIDType<T> | MenuItemsIds;

export type MenuGroup<T = unknown> = Array<MenuGroupConfigIds<T>>;

export type EntryContextMenuItems = Array<EntryContextMenuItem>;

export type WrapperParams = {
    children: React.ReactElement;
    entry: {
        entryId: string;
        scope: EntryScope;
        type: string;
        key: string;
    };
};

export type EntryContextMenuItem<T = unknown> = {
    icon: IconData | JSX.Element;
    text: string;
    action: (args?: unknown) => void;
    id: MenuGroupConfigIds<T>; // it is necessary to identify and group menu items (using separators)
    hidden?: boolean;
    menuItemClassName?: string;
    wrapper?: ({entry, children}: WrapperParams) => JSX.Element;
    qa?: string;
};

// In the Dropdown component, menu groups are formed as Array<Array<Item>>, so the config has the same structure
// Widget config only (on dashboard, preview, visard, etc.)
const MENU_GROUP_CONFIG: Array<Array<MenuItemsIds>> = [
    [MenuItemsIds.FULLSCREEEN, MenuItemsIds.EXPORT, MenuItemsIds.OPEN_AS_TABLE],
    [MenuItemsIds.MOVE, MenuItemsIds.DUPLICATE, MenuItemsIds.COPY],
    [MenuItemsIds.NEW_WINDOW, MenuItemsIds.GET_LINK],
    [MenuItemsIds.SOURCE, MenuItemsIds.INSPECTOR, MenuItemsIds.ALERTS],
    [MenuItemsIds.COMMENTS, MenuItemsIds.SHOW_COMMENTS, MenuItemsIds.HIDE_COMMENTS],
    [MenuItemsIds.EDIT, MenuItemsIds.SETTINGS],
    [MenuItemsIds.EMBEDDED],
    [MenuItemsIds.DELETE],
];

// In the Dropdown component, menu groups are formed as Array<Array<Item>>, so the config has the same structure
// Entry config only (in the top header and in the navigation)
const ENTRY_MENU_GROUP_CONFIG: Array<Array<EntryContextMenuIDType>> = [
    ['revisions'],
    ['rename', 'move', 'duplicate', 'copy'],
    ['tableOfContent', 'fullscreen'],
    ['sql', 'materialization'],
    ['access', 'show-related-entities', 'copy-link', 'public', 'sql-to-monitoring'],
    ['edit', 'settings'],
    ['migrate-to-workbook'],
    ['delete'],
];

export type MenuConfigType = 'entry' | 'widget' | null;

type MenuGroupOptions = {type: MenuConfigType; isFlat: boolean};

export function getEntryMenuConfig() {
    return ENTRY_MENU_GROUP_CONFIG as MenuGroup[];
}

export function getMenuGroupConfig() {
    return MENU_GROUP_CONFIG as Array<MenuGroup>;
}

function getMenuConfig(type: MenuConfigType) {
    const getEntryMenuConfigFn = registry.common.functions.get('getEntryMenuConfig');
    const getMenuGroupConfigFn = registry.common.functions.get('getMenuGroupConfig');
    if (type === 'entry') {
        return getEntryMenuConfigFn();
    }

    if (DL.WIDGET_MENU_GROUP_CONFIG) {
        return DL.WIDGET_MENU_GROUP_CONFIG as Array<MenuGroup>;
    }

    return getMenuGroupConfigFn();
}

function getMenuFlatConfig(config: Array<MenuGroup>) {
    return config.reduce((acc, row) => acc.concat(row), []);
}

function getUnOrderedMenuItems(items: EntryContextMenuItems, type: MenuConfigType) {
    const config = getMenuFlatConfig(getMenuConfig(type));
    const unOrderedItems = items.filter((item) => !item.id || !config.includes(item.id)) || [];
    if (unOrderedItems.length) {
        // service log for catching added menu items (grouping not involved)
        console.error(
            `Please place it to config in proper group! Menu items not included in group config: ${JSON.stringify(
                unOrderedItems.map((item) => item.id),
            )}`,
        );
    }
    return unOrderedItems;
}

function getFilteredConfig(
    items: EntryContextMenuItems,
    type: MenuConfigType,
    isFlat: boolean,
): MenuGroup | Array<MenuGroup> {
    const mappedItems = {} as Record<MenuGroupConfigIds, boolean>;
    items.forEach((item) => {
        if (!(item.id in mappedItems)) {
            mappedItems[item.id] = true;
        }
    });

    const filteredRows = getMenuConfig(type).map((row) => row.filter((item) => mappedItems[item]));
    const menuConfig = filteredRows.filter((item) => item.length);
    const isEveryMenuGroupSingle = menuConfig
        .map((item) => item.length)
        .every((item) => item === 1);
    if (isEveryMenuGroupSingle || isFlat) {
        return getMenuFlatConfig(menuConfig);
    }
    return menuConfig;
}

export function getGroupedMenu(items: EntryContextMenuItems, params?: MenuGroupOptions) {
    if (!items || !items?.length) {
        return items;
    }
    const type = params?.type || null;

    const unOrderedItems = getUnOrderedMenuItems(items, type);
    const filteredConfig = getFilteredConfig(items, type, Boolean(params?.isFlat));

    const menuItems = filteredConfig.map((row: MenuGroup | MenuGroupConfigIds) => {
        if (Array.isArray(row)) {
            return row.map((confItem) => items.find((item) => item.id === confItem));
        }
        return items.find((item) => item.id === row);
    });

    if (unOrderedItems.length) {
        menuItems.push(unOrderedItems);
    }

    return menuItems;
}
