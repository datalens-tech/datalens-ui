import React from 'react';

import {ArrowRight, Copy, LockOpen, PencilToLine, TrashBin} from '@gravity-ui/icons';
import {DropdownMenuItem} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';

import {Feature} from '../../../../../../shared';
import type {
    CollectionWithPermissions,
    UpdateCollectionResponse,
    UpdateWorkbookResponse,
    WorkbookWithPermissions,
} from '../../../../../../shared/schema';
import {
    DIALOG_COPY_WORKBOOK,
    DIALOG_DELETE_COLLECTION,
    DIALOG_DELETE_WORKBOOK,
    DIALOG_EDIT_COLLECTION,
    DIALOG_EDIT_WORKBOOK,
    DIALOG_MOVE_COLLECTION,
    DIALOG_MOVE_WORKBOOK,
} from '../../../../../components/CollectionsStructure';
import {DropdownAction} from '../../../../../components/DropdownAction/DropdownAction';
import {DIALOG_IAM_ACCESS} from '../../../../../components/IamAccessDialog';
import {ResourceType} from '../../../../../registry/units/common/types/components/IamAccessDialog';
import {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import Utils from '../../../../../utils';
import {WORKBOOKS_PATH} from '../../../../collections-navigation/constants';
import {deleteCollectionInItems, deleteWorkbookInItems} from '../../../store/actions';

const i18n = I18n.keyset('collections');

type UseActionsArgs = {
    fetchCollectionContent: () => void;
    onCloseMoveDialog: (structureChanged: boolean) => void;
};

export const useActions = ({fetchCollectionContent, onCloseMoveDialog}: UseActionsArgs) => {
    const collectionsAccessEnabled = Utils.isEnabledFeature(Feature.CollectionsAccessEnabled);

    const history = useHistory();

    const dispatch: AppDispatch = useDispatch();

    const getCollectionActions = React.useCallback(
        (item: CollectionWithPermissions): (DropdownMenuItem[] | DropdownMenuItem)[] => {
            const actions: (DropdownMenuItem[] | DropdownMenuItem)[] = [];

            if (item.permissions.update) {
                actions.push({
                    text: <DropdownAction icon={PencilToLine} text={i18n('action_edit')} />,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_EDIT_COLLECTION,
                                props: {
                                    open: true,
                                    collectionId: item.collectionId,
                                    title: item.title,
                                    description: item?.description ?? '',
                                    onApply: (collection: UpdateCollectionResponse | null) => {
                                        if (collection) {
                                            fetchCollectionContent();
                                        }
                                    },
                                    onClose: () => {
                                        dispatch(closeDialog());
                                    },
                                },
                            }),
                        );
                    },
                });
            }

            if (item.permissions.move) {
                actions.push({
                    text: <DropdownAction icon={ArrowRight} text={i18n('action_move')} />,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_MOVE_COLLECTION,
                                props: {
                                    open: true,
                                    collectionId: item.collectionId,
                                    collectionTitle: item.title,
                                    initialParentId: item.parentId,
                                    onApply: fetchCollectionContent,
                                    onClose: onCloseMoveDialog,
                                },
                            }),
                        );
                    },
                });
            }

            if (collectionsAccessEnabled && item.permissions.listAccessBindings) {
                actions.push({
                    text: <DropdownAction icon={LockOpen} text={i18n('action_access')} />,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_IAM_ACCESS,
                                props: {
                                    open: true,
                                    resourceId: item.collectionId,
                                    resourceType: ResourceType.Collection,
                                    resourceTitle: item.title,
                                    parentId: item.parentId,
                                    canUpdate: item.permissions.updateAccessBindings,
                                    onClose: () => {
                                        dispatch(closeDialog());
                                    },
                                },
                            }),
                        );
                    },
                });
            }

            const otherActions: DropdownMenuItem[] = [];

            if (item.permissions.delete) {
                otherActions.push({
                    text: <DropdownAction icon={TrashBin} text={i18n('action_delete')} />,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_DELETE_COLLECTION,
                                props: {
                                    open: true,
                                    collectionId: item.collectionId,
                                    collectionTitle: item.title,
                                    onSuccessApply: (id) => {
                                        dispatch(deleteCollectionInItems(id));
                                    },
                                    onClose: () => {
                                        dispatch(closeDialog());
                                    },
                                },
                            }),
                        );
                    },
                    theme: 'danger',
                });
            }

            actions.push([...otherActions]);

            return actions;
        },
        [collectionsAccessEnabled, dispatch, onCloseMoveDialog, fetchCollectionContent],
    );

    const getWorkbookActions = React.useCallback(
        (item: WorkbookWithPermissions): (DropdownMenuItem[] | DropdownMenuItem)[] => {
            const actions: (DropdownMenuItem[] | DropdownMenuItem)[] = [];

            if (item.permissions.update) {
                actions.push({
                    text: <DropdownAction icon={PencilToLine} text={i18n('action_edit')} />,
                    action: () => {
                        if (item?.workbookId) {
                            dispatch(
                                openDialog({
                                    id: DIALOG_EDIT_WORKBOOK,
                                    props: {
                                        open: true,
                                        workbookId: item.workbookId,
                                        title: item.title,
                                        description: item?.description ?? '',
                                        onApply: (workbook: UpdateWorkbookResponse | null) => {
                                            if (workbook) {
                                                fetchCollectionContent();
                                            }
                                        },
                                        onClose: () => {
                                            dispatch(closeDialog());
                                        },
                                    },
                                }),
                            );
                        }
                    },
                });
            }

            if (item.permissions.move) {
                actions.push({
                    text: <DropdownAction icon={ArrowRight} text={i18n('action_move')} />,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_MOVE_WORKBOOK,
                                props: {
                                    open: true,
                                    workbookId: item.workbookId,
                                    workbookTitle: item.title,
                                    initialCollectionId: item.collectionId,
                                    onApply: fetchCollectionContent,
                                    onClose: onCloseMoveDialog,
                                },
                            }),
                        );
                    },
                });
            }

            if (item.permissions.copy) {
                actions.push({
                    text: <DropdownAction icon={Copy} text={i18n('action_copy')} />,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_COPY_WORKBOOK,
                                props: {
                                    open: true,
                                    workbookId: item.workbookId,
                                    workbookTitle: item.title,
                                    initialCollectionId: item.collectionId,
                                    onApply: (workbookId) => {
                                        if (workbookId) {
                                            history.push(`${WORKBOOKS_PATH}/${workbookId}`);
                                        }
                                    },
                                    onClose: onCloseMoveDialog,
                                },
                            }),
                        );
                    },
                });
            }

            if (collectionsAccessEnabled && item.permissions.listAccessBindings) {
                actions.push({
                    text: <DropdownAction icon={LockOpen} text={i18n('action_access')} />,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_IAM_ACCESS,
                                props: {
                                    open: true,
                                    resourceId: item.workbookId,
                                    resourceType: ResourceType.Workbook,
                                    resourceTitle: item.title,
                                    parentId: item.collectionId,
                                    canUpdate: item.permissions.updateAccessBindings,
                                    onClose: () => {
                                        dispatch(closeDialog());
                                    },
                                },
                            }),
                        );
                    },
                });
            }

            const otherActions: DropdownMenuItem[] = [];

            if (item.permissions.delete) {
                otherActions.push({
                    text: <DropdownAction icon={TrashBin} text={i18n('action_delete')} />,
                    action: () => {
                        dispatch(
                            openDialog({
                                id: DIALOG_DELETE_WORKBOOK,
                                props: {
                                    open: true,
                                    workbookId: item.workbookId,
                                    workbookTitle: item.title,
                                    onSuccessApply: (id) => {
                                        dispatch(deleteWorkbookInItems(id));
                                    },
                                    onClose: () => {
                                        dispatch(closeDialog());
                                    },
                                },
                            }),
                        );
                    },
                    theme: 'danger',
                });
            }

            actions.push([...otherActions]);

            return actions;
        },
        [collectionsAccessEnabled, dispatch, onCloseMoveDialog, history, fetchCollectionContent],
    );

    return {
        getCollectionActions,
        getWorkbookActions,
    };
};
