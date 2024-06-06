import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch} from 'ui/store';
import type {CollectionsStructureDispatch} from 'ui/store/actions/collectionsStructure';
import {copyTemplate} from 'ui/store/actions/collectionsStructure';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';
import {selectCopyTemplateIsLoading} from 'ui/store/selectors/collectionsStructure';

import DialogManager from '../../components/DialogManager/DialogManager';

import {CollectionStructureDialog, ResourceType} from './CollectionStructureDialog';

const i18n = I18n.keyset('component.collections-structure');

export const DIALOG_DEPLOY_TEMPLATE_TO_WORKBOOK = Symbol('DIALOG_DEPLOY_TEMPLATE_TO_WORKBOOK');

export type OpenDialogDeployTemplateToWorkbookArgs = {
    id: typeof DIALOG_DEPLOY_TEMPLATE_TO_WORKBOOK;
    props: Props;
};

export type Props = {
    open: boolean;
    templateName: string;
    productId: string;
    needToDeployTemplate: boolean;
    defaultNewWorkbookTitle?: string;
    onApply: (workbookId: string) => void;
    onClose: () => void;
};

export const openDialogDeployTemplateToWorkbook = ({
    templateName,
    productId,
    needToDeployTemplate,
    defaultNewWorkbookTitle,
    onApply,
}: Props) => {
    return function (dispatch: AppDispatch) {
        dispatch(
            openDialog({
                id: DIALOG_DEPLOY_TEMPLATE_TO_WORKBOOK,
                props: {
                    open: true,
                    templateName,
                    productId,
                    needToDeployTemplate,
                    defaultNewWorkbookTitle,
                    onApply,
                    onClose: () => {
                        dispatch(closeDialog());
                    },
                },
            }),
        );
    };
};

export const DeployTemplateToWorkbookDialog: React.FC<Props> = ({
    open,
    templateName,
    productId,
    needToDeployTemplate,
    defaultNewWorkbookTitle,
    onApply,
    onClose,
}) => {
    const dispatch = useDispatch<CollectionsStructureDispatch>();

    const handleDeployTemplate = React.useCallback(
        async ({
            targetWorkbookId,
        }: {
            targetCollectionId: string | null;
            targetWorkbookId: string | null;
            targetTitle?: string;
        }) => {
            const workbookId = targetWorkbookId!;

            if (needToDeployTemplate) {
                await dispatch(
                    copyTemplate({
                        templateName,
                        workbookId,
                        productId,
                    }),
                );
            }
            onApply(workbookId);
        },
        [needToDeployTemplate, onApply, dispatch, templateName, productId],
    );

    const isLoading = useSelector(selectCopyTemplateIsLoading);

    return (
        <CollectionStructureDialog
            open={open}
            type={ResourceType.Workbook}
            initialCollectionId={null}
            caption={i18n('label_deploy')}
            textButtonApply={i18n('action_deploy')}
            operationDeniedMessage={i18n('label_deploy-denied-title')}
            applyIsLoading={isLoading}
            workbookSelectionMode={true}
            defaultNewWorkbookTitle={defaultNewWorkbookTitle}
            onApply={handleDeployTemplate}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_DEPLOY_TEMPLATE_TO_WORKBOOK, DeployTemplateToWorkbookDialog);
