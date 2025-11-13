import React from 'react';

import {useDispatch} from 'react-redux';
import {Feature} from 'shared';
import {
    DIALOG_CREATE_ENTRY_IN_COLLECTION,
    DIALOG_CREATE_ENTRY_IN_WORKBOOK,
} from 'ui/components/CollectionsStructure';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {DIALOG_CONN_CREATE_CONNECTION, DIALOG_CONN_CREATE_IN_WB_OR_COLLECTION} from '../../dialogs';
import type {
    OpenDialogCreateConnectionArgs,
    OpenDialogCreateConnectionInWbOrCollectionArgs,
} from '../../dialogs';

type UseCreateConnectionHandlerProps = {
    hasWorkbookIdInParams?: boolean;
    hasCollectionIdInParams?: boolean;
};

export type CreateConnectionHandlerArgs =
    | OpenDialogCreateConnectionArgs
    | OpenDialogCreateConnectionInWbOrCollectionArgs;

export const useCreateConnectionHandler = (props: UseCreateConnectionHandlerProps) => {
    const {hasWorkbookIdInParams, hasCollectionIdInParams} = props;
    const dispatch = useDispatch();

    const openCreationDialog = React.useCallback(
        (args: CreateConnectionHandlerArgs) => {
            dispatch(openDialog(args));
        },
        [dispatch],
    );

    const openCreateEntryInWorkbookDialog = React.useCallback(
        (args: OpenDialogCreateConnectionInWbOrCollectionArgs) => {
            dispatch(
                openDialog({
                    id: DIALOG_CREATE_ENTRY_IN_WORKBOOK,
                    props: {
                        entryType: 'connection',
                        disableHistoryPush: true,
                        closeDialogAfterSuccessfulApply: false,
                        onApply: (workbookId) => {
                            const extendedArgs: OpenDialogCreateConnectionInWbOrCollectionArgs = {
                                id: DIALOG_CONN_CREATE_IN_WB_OR_COLLECTION,
                                props: {
                                    workbookId,
                                    onApply: async (data) => {
                                        args.props.onApply(data);
                                        dispatch(closeDialog());
                                    },
                                },
                            };
                            openCreationDialog(extendedArgs);
                        },
                        onClose: () => dispatch(closeDialog()),
                    },
                }),
            );
        },
        [dispatch, openCreationDialog],
    );

    const openCreateEntryInCollectionDialog = React.useCallback(
        (args: OpenDialogCreateConnectionInWbOrCollectionArgs) => {
            dispatch(
                openDialog({
                    id: DIALOG_CREATE_ENTRY_IN_COLLECTION,
                    props: {
                        entryType: 'connection',
                        disableHistoryPush: true,
                        closeDialogAfterSuccessfulApply: false,
                        onApply: (collectionId) => {
                            const extendedArgs: OpenDialogCreateConnectionInWbOrCollectionArgs = {
                                id: DIALOG_CONN_CREATE_IN_WB_OR_COLLECTION,
                                props: {
                                    collectionId,
                                    onApply: async (data) => {
                                        args.props.onApply(data);
                                        dispatch(closeDialog());
                                    },
                                },
                            };
                            openCreationDialog(extendedArgs);
                        },
                        onClose: () => dispatch(closeDialog()),
                    },
                }),
            );
        },
        [dispatch, openCreationDialog],
    );

    const createConnectionHandler = React.useCallback(
        (args: CreateConnectionHandlerArgs) => {
            const {id} = args;

            switch (id) {
                case DIALOG_CONN_CREATE_CONNECTION: {
                    openCreationDialog(args);
                    break;
                }
                case DIALOG_CONN_CREATE_IN_WB_OR_COLLECTION: {
                    if (hasWorkbookIdInParams || hasCollectionIdInParams) {
                        openCreationDialog(args);
                    } else if (isEnabledFeature(Feature.EnableSharedEntries)) {
                        openCreateEntryInCollectionDialog(args);
                    } else {
                        openCreateEntryInWorkbookDialog(args);
                    }
                }
            }
        },
        [
            hasWorkbookIdInParams,
            hasCollectionIdInParams,
            openCreationDialog,
            openCreateEntryInWorkbookDialog,
            openCreateEntryInCollectionDialog,
        ],
    );

    return {createConnectionHandler};
};
