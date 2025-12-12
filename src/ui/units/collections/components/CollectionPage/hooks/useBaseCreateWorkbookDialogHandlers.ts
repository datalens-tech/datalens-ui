import React from 'react';

import {useDispatch} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import type {CreateWorkbookDialogProps} from 'ui/components/CollectionsStructure/CreateWorkbookDialog/CreateWorkbookDialog';
import type {
    RefreshPageOptions,
    UseCreateWorkbookDialogHandlers,
} from 'ui/registry/units/collections/types';

import {DIALOG_CREATE_WORKBOOK} from '../../../../../components/CollectionsStructure';
import type {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {WORKBOOKS_PATH} from '../../../../collections-navigation/constants';

export const useCreateWorkbookDialogHandlers: UseCreateWorkbookDialogHandlers = () => {
    const {collectionId = null} = useParams<{collectionId?: string}>();

    const dispatch: AppDispatch = useDispatch();

    const history = useHistory();

    const handleOpenCreateDialog = React.useCallback(
        (
            defaultView?: CreateWorkbookDialogProps['defaultView'],
            options?: {importId?: string} & RefreshPageOptions,
        ) => {
            const {refreshPageAfterImport, initialImportStatus, ...restOptions} = options ?? {};

            dispatch(
                openDialog({
                    id: DIALOG_CREATE_WORKBOOK,
                    props: {
                        open: true,
                        collectionId,
                        onCreateWorkbook: ({workbookId}) => {
                            if (workbookId) {
                                history.push(`${WORKBOOKS_PATH}/${workbookId}`);
                            }
                        },
                        onClose: () => {
                            dispatch(closeDialog());
                            if (refreshPageAfterImport && initialImportStatus !== undefined) {
                                refreshPageAfterImport(initialImportStatus);
                            }
                        },
                        defaultView,
                        showImport: true,
                        ...restOptions,
                    },
                }),
            );
        },
        [collectionId, dispatch, history],
    );

    const handleOpenCreateDialogWithConnection = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_CREATE_WORKBOOK,
                props: {
                    open: true,
                    collectionId,
                    onCreateWorkbook: ({workbookId}) => {
                        if (workbookId) {
                            history.push(`${WORKBOOKS_PATH}/${workbookId}/connections/new`);
                        }
                    },
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    }, [collectionId, dispatch, history]);

    return {
        handleOpenCreateDialog,
        handleOpenCreateDialogWithConnection,
    };
};
