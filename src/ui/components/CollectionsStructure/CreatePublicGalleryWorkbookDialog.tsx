import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';

import DialogManager from '../../components/DialogManager/DialogManager';
import {selectCopyWorkbookIsLoading} from '../../store/selectors/collectionsStructure';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';
import {DIALOG_CREATE_WORKBOOK} from './CreateWorkbookDialog/CreateWorkbookDialog';
import type {PublicGalleryData} from './types';

const i18n = I18n.keyset('component.collections-structure');

export type Props = {
    open: boolean;
    workbookTitle: string;
    onApply: (workbookId?: string) => void;
    onClose: () => void;
    publicGallery?: PublicGalleryData;
};

export const DIALOG_CREATE_PUBLIC_GALLERY_WORKBOOK = Symbol(
    'DIALOG_CREATE_PUBLIC_GALLERY_WORKBOOK',
);

export type OpenDialogCreatePublicGalleryWorkbookArgs = {
    id: typeof DIALOG_CREATE_PUBLIC_GALLERY_WORKBOOK;
    props: Props;
};

export const CreatePublicGalleryWorkbookDialog: React.FC<Props> = ({
    open,
    workbookTitle,
    onApply,
    onClose,
    publicGallery,
}) => {
    const dispatch = useDispatch();

    const copyIsLoading = useSelector(selectCopyWorkbookIsLoading);

    const handleCreateWorkbook = React.useCallback(
        async ({targetCollectionId}: {targetCollectionId: string | null}) => {
            dispatch(
                openDialog({
                    id: DIALOG_CREATE_WORKBOOK,
                    props: {
                        open: true,
                        collectionId: targetCollectionId,
                        onCreateWorkbook: ({workbookId}) => {
                            onApply(workbookId);
                        },
                        onClose: (isImportBeging) => {
                            dispatch(closeDialog());
                            if (isImportBeging) {
                                onClose();
                            }
                        },
                        showImport: true,
                        publicGallery,
                    },
                }),
            );
        },
        [dispatch, publicGallery, onApply, onClose],
    );

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Workbook}
            initialCollectionId={null}
            defaultTitle={workbookTitle}
            caption={i18n('title_deploy')}
            textButtonApply={i18n('button_deploy')}
            operationDeniedMessage={i18n('label_deploy-denied-title')}
            applyIsLoading={copyIsLoading}
            workbookSelectionMode={false}
            onApply={handleCreateWorkbook}
            onClose={onClose}
            useCustomDialog
        />
    );
};

DialogManager.registerDialog(
    DIALOG_CREATE_PUBLIC_GALLERY_WORKBOOK,
    CreatePublicGalleryWorkbookDialog,
);
