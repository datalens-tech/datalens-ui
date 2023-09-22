import {Clock, Copy, FolderArrowDown, FontCursor, Link, TrashBin} from '@gravity-ui/icons';
import {ActionPanelEntryContextMenuQa} from 'shared/constants/qa/action-panel';

import {EntryScope, Feature, isUsersFolder} from '../../../shared';
import {ALL_SCOPES, URL_QUERY} from '../../constants';
import {registry} from '../../registry';
import Utils from '../../utils/utils';
import {getAvailableScopes} from '../RevisionsPanel/utils';

import {ContextMenuItem, ContextMenuParams} from './types';

export const ENTRY_CONTEXT_MENU_ACTION = {
    RENAME: 'rename',
    DELETE: 'delete',
    MOVE: 'move',
    COPY: 'copy',
    ACCESS: 'access',
    COPY_LINK: 'copy-link',
    REVISIONS: 'revisions',
    MIGRATE_TO_WORKBOOK: 'migrate-to-workbook',
};

const CONTEXT_MENU_COPY = {
    id: ENTRY_CONTEXT_MENU_ACTION.COPY,

    action: ENTRY_CONTEXT_MENU_ACTION.COPY,
    icon: Copy,
    qa: ActionPanelEntryContextMenuQa.Copy,
    text: 'value_duplicate',
    enable: () => Utils.isEnabledFeature(Feature.EntryMenuItemCopy),
    permissions: (entry: ContextMenuParams['entry']) => {
        return entry?.workbookId
            ? {admin: true, edit: true, read: false, execute: false}
            : undefined;
    },
    // remain Copy menu item in navigation, but show in actionPanel only if actual version is opened
    isVisible({showSpecificItems}: ContextMenuParams) {
        const searchParams = new URLSearchParams(window.location.search);
        const revId = searchParams.get(URL_QUERY.REV_ID);
        return showSpecificItems ? !revId : true;
    },
};

const getContextMenuAccess = () => {
    const getAccessItem = registry.common.functions.get('getAccessEntryMenuItem');
    return getAccessItem();
};

const getContextMenuMoveToWorkbooks = () => {
    const getMoveToWorkbooksItem = registry.common.functions.get('getMoveToWorkbooksMenuItem');
    return getMoveToWorkbooksItem();
};

const getAdditionalEntryContextMenuItems = (): ContextMenuItem[] => {
    const fn = registry.common.functions.get('getAdditionalEntryContextMenuItems');

    return fn();
};

export const getEntryContextMenu = (): ContextMenuItem[] => [
    {
        id: ENTRY_CONTEXT_MENU_ACTION.REVISIONS,
        action: ENTRY_CONTEXT_MENU_ACTION.REVISIONS,
        icon: Clock,
        text: 'value_revisions',
        qa: ActionPanelEntryContextMenuQa.Revisions,
        enable: () => true,
        scopes: ALL_SCOPES,
        isSpecific: true,
        isOnEditMode: false,
        isVisible({entry, isLimitedView}: ContextMenuParams) {
            if (!entry || !entry.scope || isLimitedView) return false;

            return getAvailableScopes().includes(entry.scope as EntryScope);
        },
    },
    {
        id: ENTRY_CONTEXT_MENU_ACTION.RENAME,
        action: ENTRY_CONTEXT_MENU_ACTION.RENAME,
        icon: FontCursor,
        text: 'value_rename',
        enable: () => true,
        permissions: (entry: ContextMenuParams['entry']) => {
            // allow renaming entries in the workbook with the "edit" permission
            return entry?.workbookId
                ? {admin: true, edit: true, read: false, execute: false}
                : {admin: true, edit: false, read: false, execute: false};
        },
        scopes: ALL_SCOPES,
        isVisible({entry}: ContextMenuParams) {
            return !isUsersFolder(entry?.key);
        },
    },
    {
        id: ENTRY_CONTEXT_MENU_ACTION.DELETE,
        action: ENTRY_CONTEXT_MENU_ACTION.DELETE,
        icon: TrashBin,
        text: 'value_delete',
        enable: () => true,
        permissions: (entry: ContextMenuParams['entry']) => {
            // allow deleting an entry in the workbook with the "edit" permission
            return entry?.workbookId
                ? {admin: true, edit: true, read: false, execute: false}
                : {admin: true, edit: false, read: false, execute: false};
        },
        scopes: ALL_SCOPES,
        isVisible({entry}: ContextMenuParams) {
            return !isUsersFolder(entry?.key);
        },
        qa: ActionPanelEntryContextMenuQa.Remove,
    },
    {
        id: ENTRY_CONTEXT_MENU_ACTION.MOVE,
        action: ENTRY_CONTEXT_MENU_ACTION.MOVE,
        icon: FolderArrowDown,
        text: 'value_move',
        enable: () => Utils.isEnabledFeature(Feature.EntryMenuItemMove),
        permissions: {admin: true, edit: false, read: false, execute: false},
        scopes: ALL_SCOPES,
        isVisible({entry}: ContextMenuParams) {
            return !isUsersFolder(entry?.key) && !entry?.workbookId;
        },
    },
    // different Copy menu for dash/widgets and datasets/configs
    {
        ...CONTEXT_MENU_COPY,
        scopes: [EntryScope.Dash, EntryScope.Widget],
        // allow to show if there are no permissions
    },
    {
        ...CONTEXT_MENU_COPY,
        scopes: [EntryScope.Dataset],
        permissions: {admin: true, edit: true, read: false, execute: false},
        isStrictPermissions: true, // strict check with disallow when there are no permissions object
        isVisible(args) {
            if (args.entry?.workbookId) {
                return false;
            }

            return CONTEXT_MENU_COPY.isVisible(args);
        },
    },
    getContextMenuAccess(),
    {
        id: ENTRY_CONTEXT_MENU_ACTION.COPY_LINK,
        action: ENTRY_CONTEXT_MENU_ACTION.COPY_LINK,
        icon: Link,
        text: 'value_copy-link',
        enable: () => true,
        scopes: ALL_SCOPES,
    },
    ...getAdditionalEntryContextMenuItems(),
    getContextMenuMoveToWorkbooks(),
];
