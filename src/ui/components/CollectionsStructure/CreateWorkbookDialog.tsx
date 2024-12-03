import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {AppDispatch} from 'store';

import type {CreateWorkbookResponse} from '../../../shared/schema';
import {createWorkbook} from '../../store/actions/collectionsStructure';
import {selectCreateWorkbookIsLoading} from '../../store/selectors/collectionsStructure';
import DialogManager from '../DialogManager/DialogManager';

import {WorkbookDialog} from './WorkbookDialog';

const i18n = I18n.keyset('component.collections-structure');

export const DIALOG_CREATE_WORKBOOK = Symbol('DIALOG_CREATE_WORKBOOK');

export type OpenDialogCreateWorkbookArgs = {
    id: typeof DIALOG_CREATE_WORKBOOK;
    props: Props;
};

type Props = {
    collectionId: string | null;
    open: boolean;
    dialogTitle?: string;
    defaultWorkbookTitle?: string;
    onClose: () => void;
    onApply?: (result: CreateWorkbookResponse | null) => void | Promise<void>;
};

export const CreateWorkbookDialog: React.FC<Props> = (props) => {
    const dispatch: AppDispatch = useDispatch();
    const {open, dialogTitle, defaultWorkbookTitle, onClose} = props;

    const handleApply = async ({title, description}: {title: string; description?: string}) => {
        const {collectionId, onApply} = props;

        const result = await dispatch(
            createWorkbook({
                title,
                description: description ?? '',
                collectionId,
            }),
        );

        if (onApply) {
            const promise = onApply(result);
            if (promise) {
                await promise;
            }
        }

        return result;
    };

    const isLoading = useSelector(selectCreateWorkbookIsLoading);

    return (
        <WorkbookDialog
            title={dialogTitle ?? i18n('action_create-workbook')}
            textButtonApply={i18n('action_create')}
            open={open}
            isLoading={isLoading}
            titleValue={defaultWorkbookTitle}
            onApply={handleApply}
            onClose={onClose}
            titleAutoFocus
        />
    );
};

DialogManager.registerDialog(DIALOG_CREATE_WORKBOOK, CreateWorkbookDialog);
