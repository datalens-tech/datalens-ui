import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ErrorCode} from 'shared/constants';
import type {UpdateWorkbookResponse} from 'shared/schema';
import type {AppDispatch} from 'store';

import DialogManager from '../../components/DialogManager/DialogManager';
import {updateWorkbook} from '../../store/actions/collectionsStructure';
import {selectUpdateWorkbookIsLoading} from '../../store/selectors/collectionsStructure';

import {WorkbookDialog, type WorkbookDialogValues} from './WorkbookDialog';
import {useCollectionEntityDialogState} from './hooks/useCollectionEntityDialogState';

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

    const {title, description, open, onClose} = props;

    const {
        values: dialogValues,
        errors: dialogErrors,
        handleChange: handleDialogChange,
        handleError: handleDialogError,
    } = useCollectionEntityDialogState({
        title,
        description,
    });

    const isLoading = useSelector(selectUpdateWorkbookIsLoading);

    const handleApply = React.useCallback(
        async (
            {title: dialogTitle, description: dialogDescription}: WorkbookDialogValues,
            dialogOnClose: () => void,
        ) => {
            const {workbookId, onApply} = props;

            try {
                const result = await dispatch(
                    updateWorkbook(
                        {
                            workbookId,
                            title: dialogTitle,
                            description: dialogDescription ?? '',
                        },
                        true,
                    ),
                );

                if (onApply) {
                    onApply(result);
                }

                dialogOnClose();
            } catch (error) {
                if (error.code === ErrorCode.WorkbookAlreadyExists) {
                    handleDialogError({title: i18n('label_workbook-already-exists-error')});
                }
            }
        },
        [dispatch, handleDialogError, props],
    );

    return (
        <WorkbookDialog
            values={dialogValues}
            errors={dialogErrors}
            title={i18n('action_edit-workbook')}
            textButtonApply={i18n('action_save')}
            open={open}
            isLoading={isLoading}
            titleAutoFocus
            onChange={handleDialogChange}
            onApply={handleApply}
            onClose={onClose}
        />
    );
};

DialogManager.registerDialog(DIALOG_EDIT_WORKBOOK, EditWorkbookDialog);
