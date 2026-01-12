import React from 'react';

import {CodeTrunk, Persons, Shield, TrashBin} from '@gravity-ui/icons';
import type {History} from 'history';
import {I18n} from 'i18n';
import {EntryScope, getEntryNameByKey} from 'shared';
import type {EntityBindingsArgs, EntityBindingsResponse} from 'shared/schema';
import {DIALOG_SHARED_ENTRY_BINDINGS} from 'ui/components/DialogSharedEntryBindings/DialogSharedEntryBindings';
import {DIALOG_SHARED_ENTRY_PERMISSIONS} from 'ui/components/DialogSharedEntryPermissions/DialogSharedEntryPermissions';
import {DIALOG_SHARED_RELATED_ENTITIES} from 'ui/components/DialogSharedRelatedEntities/DialogSharedRelatedEntities';
import {ENTRY_CONTEXT_MENU_ACTION} from 'ui/components/EntryContextMenu';
import type {EntryContextMenuItem} from 'ui/components/EntryContextMenu/helpers';
import {DIALOG_IAM_ACCESS} from 'ui/components/IamAccessDialog';
import {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';
import type {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import type {DatasetEntry} from '../../typings/dataset';

const i18ContextMenu = I18n.keyset('component.entry-context-menu.view');
type GetAdditionalContextMenuItemsProps = {
    isSharedDataset: boolean;
    entry: DatasetEntry;
    history: History;
    bindedWorkbookId?: string | null;
    updateDatasetDelegation: (
        args: EntityBindingsArgs,
    ) => Promise<EntityBindingsResponse | undefined>;
    openDialog: typeof openDialog;
    closeDialog: typeof closeDialog;
};
export const getAdditionalContextMenuItems = ({
    isSharedDataset,
    entry,
    openDialog,
    closeDialog,
    history,
    bindedWorkbookId,
    updateDatasetDelegation,
}: GetAdditionalContextMenuItemsProps) => {
    if (!isSharedDataset || entry.fake) {
        return;
    }

    const isWorkbookSharedDataset = isSharedDataset && bindedWorkbookId;
    const items: (EntryContextMenuItem & {theme?: string})[] = [];

    if (isWorkbookSharedDataset) {
        items.push(
            {
                id: ENTRY_CONTEXT_MENU_ACTION.ACCESS,
                action: () => {
                    openDialog({
                        id: DIALOG_SHARED_ENTRY_PERMISSIONS,
                        props: {
                            onClose: closeDialog,
                            open: true,
                            onApply: async (delegate) => {
                                const result = await updateDatasetDelegation({
                                    sourceId: entry.entryId,
                                    targetId: bindedWorkbookId,
                                    delegation: delegate,
                                });
                                if (result) {
                                    closeDialog();
                                }
                            },
                            entry,
                            delegation: entry.isDelegated,
                        },
                    });
                },
                icon: <Shield />,
                text: getSharedEntryMockText('shared-entry-bindings-dropdown-menu-title'),
            },
            {
                id: ENTRY_CONTEXT_MENU_ACTION.DELETE,
                action: () => {
                    openDialog({
                        id: DIALOG_SHARED_RELATED_ENTITIES,
                        props: {
                            onClose: closeDialog,
                            open: true,
                            workbookId: bindedWorkbookId,
                            entry,
                            isDeleteDialog: true,
                            onDeleteSuccess: () => {
                                closeDialog();
                                history.push(`/workbooks/${bindedWorkbookId}`);
                            },
                        },
                    });
                },
                icon: <TrashBin />,
                theme: 'danger',
                text: getSharedEntryMockText('shared-entry-delete-dropdown-menu-title'),
            },
        );
    } else {
        items.push(
            {
                id: ENTRY_CONTEXT_MENU_ACTION.SHOW_RELATED_ENTITIES,
                action: () => {
                    openDialog({
                        id: DIALOG_SHARED_ENTRY_BINDINGS,
                        props: {
                            onClose: closeDialog,
                            open: true,
                            entry,
                        },
                    });
                },
                icon: <CodeTrunk />,
                text: getSharedEntryMockText('shared-entry-bindings-dropdown-menu-title'),
            },
            {
                id: ENTRY_CONTEXT_MENU_ACTION.ACCESS,
                action: () =>
                    openDialog({
                        id: DIALOG_IAM_ACCESS,
                        props: {
                            open: true,
                            resourceId: entry.entryId,
                            resourceType: ResourceType.SharedEntry,
                            resourceTitle: getEntryNameByKey({key: entry.key}),
                            resourceScope: EntryScope.Dataset,
                            parentId: entry.collectionId!,
                            canUpdate: Boolean(entry.fullPermissions?.updateAccessBindings),
                            onClose: closeDialog,
                        },
                    }),
                icon: <Persons />,
                text: i18ContextMenu('value_access'),
            },
            {
                id: ENTRY_CONTEXT_MENU_ACTION.DELETE,
                action: () => {
                    openDialog({
                        id: DIALOG_SHARED_ENTRY_BINDINGS,
                        props: {
                            onClose: closeDialog,
                            open: true,
                            entry,
                            isDeleteDialog: true,
                            onDeleteSuccess: () => {
                                closeDialog();
                                history.push(`/collections/${entry?.collectionId}`);
                            },
                        },
                    });
                },
                icon: <TrashBin />,
                theme: 'danger',
                text: getSharedEntryMockText('shared-entry-delete-dropdown-menu-title'),
            },
        );
    }
    return items;
};
