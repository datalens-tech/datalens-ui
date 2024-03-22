import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {UpdateWorkbookResponse} from 'shared/schema';
import {AppDispatch} from 'store';

import DialogManager from '../../components/DialogManager/DialogManager';
import {updateWorkbook} from '../../store/actions/collectionsStructure';
import {selectUpdateWorkbookIsLoading} from '../../store/selectors/collectionsStructure';

import {WorkbookDialog} from './WorkbookDialog';

const i18n = I18n.keyset('component.collections-structure');

type Props = {
    workbookId: string;
    title: string;
    description: string;
    open: boolean;
    onClose: () => void;
    onApply?: (result: UpdateWorkbookResponse | null) => void;
};

export const DIALOG_EDIT_WORKBOOK = Symbol('DIALOG_EDIT_WORKBOOK');

export type OpenDialogEditWorkbookArgs = {
    id: typeof DIALOG_EDIT_WORKBOOK;
    props: Props;
};

export const EditWorkbookDialog: React.FC<Props> = (props) => {
    const dispatch: AppDispatch = useDispatch();

    const isLoading = useSelector(selectUpdateWorkbookIsLoading);

    const handleApply = React.useCallback(
        async ({title, description}: {title: string; description?: string}) => {
            const {workbookId, onApply} = props;

            const result = await dispatch(
                updateWorkbook({
                    workbookId,
                    title,
                    description: description ?? '',
                }),
            );

            if (onApply) {
                onApply(result);
            }

            return result;
        },
        [dispatch, props],
    );

    const {title, description, open, onClose} = props;

    return (
        <WorkbookDialog
            title={i18n('action_edit-workbook')}
            titleValue={title}
            descriptionValue={description}
            textButtonApply={i18n('action_save')}
            open={open}
            isLoading={isLoading}
            titleAutoFocus
            onApply={handleApply}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_EDIT_WORKBOOK, EditWorkbookDialog);
