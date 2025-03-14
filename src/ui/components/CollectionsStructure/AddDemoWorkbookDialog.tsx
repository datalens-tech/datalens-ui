import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import type {CopyWorkbookTemplateResponse} from '../../../shared/schema';
import DialogManager from '../../components/DialogManager/DialogManager';
import type {AppDispatch} from '../../store';
import {addDemoWorkbook} from '../../store/actions/collectionsStructure';
import {selectAddDemoWorkbookIsLoading} from '../../store/selectors/collectionsStructure';

import {WorkbookDialog} from './WorkbookDialog';

const i18n = I18n.keyset('component.collections-structure');

type Props = {
    open: boolean;
    collectionId: string | null;
    demoWorkbookId: string;
    title: string;
    onClose: () => void;
    onSuccessApply?: (result: CopyWorkbookTemplateResponse | null) => void;
};

export const DIALOG_ADD_DEMO_WORKBOOK = Symbol('DIALOG_ADD_DEMO_WORKBOOK');

export type OpenDialogAddDemoWorkbookArgs = {
    id: typeof DIALOG_ADD_DEMO_WORKBOOK;
    props: Props;
};

export const AddDemoWorkbookDialog: React.FC<Props> = ({
    open,
    collectionId,
    demoWorkbookId,
    title,
    onClose,
    onSuccessApply,
}) => {
    const dispatch: AppDispatch = useDispatch();
    const isLoading = useSelector(selectAddDemoWorkbookIsLoading);

    const onApply = React.useCallback(
        async ({title: workbookTitle, onClose}: {title: string; onClose: () => void}) => {
            const result = await dispatch(
                addDemoWorkbook({
                    workbookId: demoWorkbookId,
                    collectionId,
                    title: workbookTitle,
                }),
            );

            if (onSuccessApply) {
                onSuccessApply(result);
            }

            onClose();
        },
        [collectionId, demoWorkbookId, dispatch, onSuccessApply],
    );

    return (
        <WorkbookDialog
            title={title}
            textButtonApply={i18n('action_add')}
            open={open}
            isLoading={isLoading}
            isHiddenDescription
            onApply={onApply}
            onClose={onClose}
            titleAutoFocus
        />
    );
};

DialogManager.registerDialog(DIALOG_ADD_DEMO_WORKBOOK, AddDemoWorkbookDialog);
