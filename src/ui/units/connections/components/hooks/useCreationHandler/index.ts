import React from 'react';

import {useDispatch} from 'react-redux';
import {DIALOG_CREATE_ENTRY_IN_WORKBOOK} from 'ui/components/CollectionsStructure';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';

import {DIALOG_CONN_CREATE_CONNECTION, DIALOG_CONN_CREATE_IN_WB_CONNECTION} from '../../dialogs';
import type {
    OpenDialogCreateConnectionArgs,
    OpenDialogCreateConnectionInWbArgs,
} from '../../dialogs';

type UseCreateConnectionHandlerProps = {
    hasWorkbookIdInParams?: boolean;
};

export type CreateConnectionHandlerArgs =
    | OpenDialogCreateConnectionArgs
    | OpenDialogCreateConnectionInWbArgs;

export const useCreateConnectionHandler = (props: UseCreateConnectionHandlerProps) => {
    const {hasWorkbookIdInParams} = props;
    const dispatch = useDispatch();

    const openCreationDialog = React.useCallback(
        (args: CreateConnectionHandlerArgs) => {
            dispatch(openDialog(args));
        },
        [dispatch],
    );

    const openCreateEntryInWorkbookDialog = React.useCallback(
        (args: OpenDialogCreateConnectionInWbArgs) => {
            dispatch(
                openDialog({
                    id: DIALOG_CREATE_ENTRY_IN_WORKBOOK,
                    props: {
                        entryType: 'connection',
                        disableHistoryPush: true,
                        closeDialogAfterSuccessfulApply: false,
                        onApply: (workbookId) => {
                            const extendedArgs: OpenDialogCreateConnectionInWbArgs = {
                                id: DIALOG_CONN_CREATE_IN_WB_CONNECTION,
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

    const createConnectionHandler = React.useCallback(
        (args: CreateConnectionHandlerArgs) => {
            const {id} = args;

            switch (id) {
                case DIALOG_CONN_CREATE_CONNECTION: {
                    openCreationDialog(args);
                    break;
                }
                case DIALOG_CONN_CREATE_IN_WB_CONNECTION: {
                    if (hasWorkbookIdInParams) {
                        openCreationDialog(args);
                    } else {
                        openCreateEntryInWorkbookDialog(args);
                    }
                }
            }
        },
        [hasWorkbookIdInParams, openCreationDialog, openCreateEntryInWorkbookDialog],
    );

    return {createConnectionHandler};
};
