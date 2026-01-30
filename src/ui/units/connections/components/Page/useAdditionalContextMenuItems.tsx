import React from 'react';

import {CodeTrunk, Persons, Shield, TrashBin} from '@gravity-ui/icons';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {useHistory} from 'react-router';
import {EntryScope, getEntryNameByKey} from 'shared';
import {DIALOG_SHARED_ENTRY_BINDINGS} from 'ui/components/DialogSharedEntryBindings/DialogSharedEntryBindings';
import {DIALOG_SHARED_ENTRY_PERMISSIONS} from 'ui/components/DialogSharedEntryPermissions/DialogSharedEntryPermissions';
import {DIALOG_SHARED_RELATED_ENTITIES} from 'ui/components/DialogSharedRelatedEntities/DialogSharedRelatedEntities';
import {ENTRY_CONTEXT_MENU_ACTION} from 'ui/components/EntryContextMenu';
import type {EntryContextMenuItem} from 'ui/components/EntryContextMenu/helpers';
import {DIALOG_IAM_ACCESS} from 'ui/components/IamAccessDialog';
import {getSdk} from 'ui/libs/schematic-sdk';
import {ResourceType} from 'ui/registry/units/common/types/components/IamAccessDialog';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {showToast} from 'ui/store/actions/toaster';
import {getSharedEntryMockText} from 'ui/units/collections/components/helpers';

import type {ConnectionEntry} from '../../store';
import {setEntryDelegation} from '../../store';

import {getIsSharedConnection} from './utils';

const i18ContextMenu = I18n.keyset('component.entry-context-menu.view');

type UseAdditionalContextMenuItemsProps = {
    entry?: ConnectionEntry;
    isFakeEntry?: boolean;
    bindedWorkbookId?: string | null;
    bindedDatasetId?: string | null;
};

export const useAdditionalContextMenuItems = ({
    entry,
    isFakeEntry,
    bindedWorkbookId,
    bindedDatasetId,
}: UseAdditionalContextMenuItemsProps) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const isSharedConnection = getIsSharedConnection(entry);
    const isWorkbookSharedEntry = isSharedConnection && bindedWorkbookId;

    return React.useMemo(() => {
        if (!isSharedConnection || !entry || isFakeEntry || bindedDatasetId) {
            return;
        }
        const items: (EntryContextMenuItem & {theme?: string})[] = [];
        if (isWorkbookSharedEntry) {
            if (entry.permissions?.admin || entry.fullPermissions?.updateAccessBindings) {
                items.push({
                    id: ENTRY_CONTEXT_MENU_ACTION.ACCESS,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_SHARED_ENTRY_PERMISSIONS,
                                props: {
                                    onClose: () => dispatch(closeDialog()),
                                    open: true,
                                    onApply: async (delegate) => {
                                        if (delegate === entry.isDelegated) {
                                            dispatch(closeDialog());
                                            return;
                                        }
                                        try {
                                            const delegation =
                                                await getSdk().sdk.us.updateSharedEntryBinding({
                                                    sourceId: entry.entryId,
                                                    targetId: bindedWorkbookId,
                                                    delegation: delegate,
                                                });
                                            if (delegation) {
                                                dispatch(
                                                    setEntryDelegation(delegation.isDelegated),
                                                );
                                            }
                                            dispatch(closeDialog());
                                        } catch (error) {
                                            dispatch(
                                                showToast({
                                                    title: error.message,
                                                    error,
                                                }),
                                            );
                                        }
                                    },
                                    entry,
                                    delegation: entry.isDelegated,
                                },
                            }),
                        );
                    },
                    icon: <Shield />,
                    text: getSharedEntryMockText('shared-entry-bindings-dropdown-menu-title'),
                });
            }
            if (entry.fullPermissions.delete) {
                items.push({
                    id: ENTRY_CONTEXT_MENU_ACTION.DELETE,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_SHARED_RELATED_ENTITIES,
                                props: {
                                    onClose: () => dispatch(closeDialog()),
                                    open: true,
                                    workbookId: bindedWorkbookId,
                                    entry,
                                    isDeleteDialog: true,
                                    onDeleteSuccess: () => {
                                        dispatch(closeDialog());
                                        history.push(`/workbooks/${bindedWorkbookId}`);
                                    },
                                },
                            }),
                        );
                    },
                    icon: <TrashBin />,
                    theme: 'danger',
                    text: getSharedEntryMockText('shared-entry-delete-dropdown-menu-title'),
                });
            }
        } else {
            if (entry.permissions?.admin || entry.fullPermissions?.updateAccessBindings) {
                items.push({
                    id: ENTRY_CONTEXT_MENU_ACTION.SHOW_RELATED_ENTITIES,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_SHARED_ENTRY_BINDINGS,
                                props: {
                                    onClose: () => dispatch(closeDialog()),
                                    open: true,
                                    entry,
                                },
                            }),
                        );
                    },
                    icon: <CodeTrunk />,
                    text: getSharedEntryMockText('shared-entry-bindings-dropdown-menu-title'),
                });
            }
            if (entry.fullPermissions.listAccessBindings) {
                items.push({
                    id: ENTRY_CONTEXT_MENU_ACTION.ACCESS,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_IAM_ACCESS,
                                props: {
                                    open: true,
                                    resourceId: entry.entryId,
                                    resourceType: ResourceType.SharedEntry,
                                    resourceTitle: getEntryNameByKey({key: entry.key}),
                                    resourceScope: EntryScope.Connection,
                                    parentId: entry.collectionId,
                                    canUpdate: Boolean(entry.fullPermissions?.updateAccessBindings),
                                    onClose: () => dispatch(closeDialog()),
                                },
                            }),
                        );
                    },
                    icon: <Persons />,
                    text: i18ContextMenu('value_access'),
                });
            }
            if (entry.fullPermissions.delete) {
                items.push({
                    id: ENTRY_CONTEXT_MENU_ACTION.DELETE,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_SHARED_ENTRY_BINDINGS,
                                props: {
                                    onClose: () => dispatch(closeDialog()),
                                    open: true,
                                    entry,
                                    isDeleteDialog: true,
                                    onDeleteSuccess: () => {
                                        dispatch(closeDialog());
                                        history.push(`/collections/${entry?.collectionId}`);
                                    },
                                },
                            }),
                        );
                    },
                    icon: <TrashBin />,
                    theme: 'danger',
                    text: getSharedEntryMockText('shared-entry-delete-dropdown-menu-title'),
                });
            }
        }
        return items;
    }, [
        isSharedConnection,
        entry,
        isFakeEntry,
        dispatch,
        history,
        isWorkbookSharedEntry,
        bindedWorkbookId,
    ]);
};
