import {
    ArrowShapeTurnUpRight,
    Clock,
    CodeTrunk,
    Copy,
    FolderArrowDown,
    FontCursor,
    Link,
    Tag,
    TrashBin,
} from '@gravity-ui/icons';
import type {ConnectorType} from 'shared/constants/connections';
import {ActionPanelEntryContextMenuQa} from 'shared/constants/qa/action-panel';
import {S3_BASED_CONNECTORS} from 'ui/constants/connections';

import {EntryScope, Feature, PLACE, isUsersFolder} from '../../../shared';
import {URL_QUERY} from '../../constants';
import {registry} from '../../registry';
import Utils from '../../utils/utils';

import type {ContextMenuItem, ContextMenuParams} from './types';

export const ENTRY_CONTEXT_MENU_ACTION = {
    RENAME: 'rename',
    ADD_FAVORITES_ALIAS: 'add-favorites-alias',
    EDIT_FAVORITES_ALIAS: 'edit-favorites-alias',
    DELETE: 'delete',
    MOVE: 'move',
    COPY: 'copy',
    ACCESS: 'access',
    COPY_LINK: 'copy-link',
    SHARE: 'share',
    REVISIONS: 'revisions',
    MIGRATE_TO_WORKBOOK: 'migrate-to-workbook',
    SHOW_RELATED_ENTITIES: 'show-related-entities',
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
    isVisible({showSpecificItems, entry}: ContextMenuParams) {
        if (!showSpecificItems && entry?.workbookId) {
            return false;
        }

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

const isVisibleEntryContextShareItem = ({entry, showSpecificItems}: ContextMenuParams): boolean =>
    entry?.scope === EntryScope.Dash &&
    showSpecificItems &&
    Utils.isEnabledFeature(Feature.EnableEntryMenuItemShare);

export const getEntryContextMenu = (): ContextMenuItem[] => {
    const {getTopLevelEntryScopes, getAllEntryScopes, getEntryScopesWithRevisionsList} =
        registry.common.functions.getAll();

    return [
        {
            id: ENTRY_CONTEXT_MENU_ACTION.REVISIONS,
            action: ENTRY_CONTEXT_MENU_ACTION.REVISIONS,
            icon: Clock,
            text: 'value_revisions',
            qa: ActionPanelEntryContextMenuQa.Revisions,
            enable: () => true,
            scopes: getAllEntryScopes(),
            isSpecific: true,
            isOnEditMode: false,
            permissions: () => ({admin: true, edit: true, read: false, execute: false}),
            isVisible({entry, isLimitedView}: ContextMenuParams) {
                if (!entry || !entry.scope || isLimitedView) return false;

                return getEntryScopesWithRevisionsList().includes(entry.scope as EntryScope);
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
            scopes: getAllEntryScopes(),
            isVisible({entry}: ContextMenuParams) {
                return !isUsersFolder(entry?.key);
            },
        },
        {
            id: ENTRY_CONTEXT_MENU_ACTION.ADD_FAVORITES_ALIAS,
            action: ENTRY_CONTEXT_MENU_ACTION.ADD_FAVORITES_ALIAS,
            icon: Tag,
            text: 'value_add-favorites-alias',
            place: PLACE.FAVORITES,
            enable: () => true,
            scopes: getAllEntryScopes(),
            isVisible({entry}: ContextMenuParams) {
                return !entry?.displayAlias;
            },
        },
        {
            id: ENTRY_CONTEXT_MENU_ACTION.EDIT_FAVORITES_ALIAS,
            action: ENTRY_CONTEXT_MENU_ACTION.EDIT_FAVORITES_ALIAS,
            icon: Tag,
            text: 'value_edit-favorites-alias',
            place: PLACE.FAVORITES,
            enable: () => true,
            scopes: getAllEntryScopes(),
            isVisible({entry}: ContextMenuParams) {
                return Boolean(entry?.displayAlias);
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
            scopes: getAllEntryScopes(),
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
            scopes: getAllEntryScopes(),
            isVisible({entry}: ContextMenuParams) {
                return !isUsersFolder(entry?.key) && !entry?.workbookId;
            },
        },
        // different Copy menu for dash/widgets and datasets/configs
        {
            ...CONTEXT_MENU_COPY,
            scopes: [EntryScope.Widget, ...getTopLevelEntryScopes()],
            // allow to show if there are no permissions
        },
        {
            ...CONTEXT_MENU_COPY,
            scopes: [EntryScope.Connection],
            permissions: {admin: true, edit: true, read: false, execute: false},
            isStrictPermissions: true, // strict check with disallow when there are no permissions object
            isVisible(args) {
                const entry = args.entry;
                const isS3BasedConnector = S3_BASED_CONNECTORS.includes(
                    entry?.type as ConnectorType,
                );
                const isFileConnection =
                    entry?.scope === EntryScope.Connection && isS3BasedConnector;

                if (!args.entry?.workbookId || isFileConnection) {
                    return false;
                }

                return CONTEXT_MENU_COPY.isVisible(args);
            },
        },
        {
            ...CONTEXT_MENU_COPY,
            scopes: [EntryScope.Dataset],
            permissions: {admin: true, edit: true, read: false, execute: false},
            isStrictPermissions: true, // strict check with disallow when there are no permissions object
        },
        getContextMenuAccess(),
        {
            id: ENTRY_CONTEXT_MENU_ACTION.COPY_LINK,
            action: ENTRY_CONTEXT_MENU_ACTION.COPY_LINK,
            icon: Link,
            text: 'value_copy-link',
            enable: () => true,
            scopes: getAllEntryScopes(),
            isVisible: (params) => !isVisibleEntryContextShareItem(params),
        },
        {
            id: ENTRY_CONTEXT_MENU_ACTION.SHARE,
            action: ENTRY_CONTEXT_MENU_ACTION.SHARE,
            icon: ArrowShapeTurnUpRight,
            text: 'value_share',
            enable: () => true,
            scopes: getAllEntryScopes(),
            isVisible: isVisibleEntryContextShareItem,
        },
        {
            id: ENTRY_CONTEXT_MENU_ACTION.SHOW_RELATED_ENTITIES,
            action: ENTRY_CONTEXT_MENU_ACTION.SHOW_RELATED_ENTITIES,
            icon: CodeTrunk,
            text: 'value_show-related-entities',
            enable: () => true,
            scopes: [
                EntryScope.Widget,
                EntryScope.Dataset,
                EntryScope.Connection,
                ...getTopLevelEntryScopes(),
            ],
        },
        ...getAdditionalEntryContextMenuItems(),
        getContextMenuMoveToWorkbooks(),
    ];
};
