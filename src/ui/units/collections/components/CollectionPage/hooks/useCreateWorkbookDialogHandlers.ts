import React from 'react';

import {useDispatch} from 'react-redux';
import {useHistory, useParams} from 'react-router-dom';
import type {ProcessStatus} from 'shared/types/meta-manager';
import type {CreateWorkbookDialogProps} from 'ui/components/CollectionsStructure/CreateWorkbookDialog/CreateWorkbookDialog';
import type {PublicGalleryData} from 'ui/components/CollectionsStructure/types';

import {DIALOG_CREATE_WORKBOOK} from '../../../../../components/CollectionsStructure';
import {DIALOG_CREATE_PUBLIC_GALLERY_WORKBOOK} from '../../../../../components/CollectionsStructure/CreatePublicGalleryWorkbookDialog';
import type {AppDispatch} from '../../../../../store';
import {closeDialog, openDialog} from '../../../../../store/actions/dialog';
import {WORKBOOKS_PATH} from '../../../../collections-navigation/constants';
import type {RefreshPageAfterImport} from '../../../hooks/useRefreshPageAfterImport';

type RefreshPageOptions = {
    refreshPageAfterImport: RefreshPageAfterImport;
    initialImportStatus: ProcessStatus | null;
};

export const useCreateWorkbookDialogHandlers = () => {
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

    const handleOpenCreatePublicGalleryDialog = React.useCallback(
        ({
            publicGallery,
            refreshPageAfterImport,
            initialImportStatus,
        }: {publicGallery: PublicGalleryData} & RefreshPageOptions) => {
            dispatch(
                openDialog({
                    id: DIALOG_CREATE_PUBLIC_GALLERY_WORKBOOK,
                    props: {
                        open: true,
                        workbookTitle: publicGallery.title,
                        onClose: () => {
                            dispatch(closeDialog());
                            // Clean up url
                            history.replace(location.pathname);
                            refreshPageAfterImport(initialImportStatus);
                        },
                        onApply: (workbookId?: string) => {
                            if (workbookId) {
                                history.push(`${WORKBOOKS_PATH}/${workbookId}`);
                            }
                        },
                        publicGallery,
                    },
                }),
            );
        },
        [dispatch, history],
    );

    return {
        handleOpenCreateDialog,
        handleOpenCreateDialogWithConnection,
        handleOpenCreatePublicGalleryDialog,
    };
};
