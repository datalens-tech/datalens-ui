import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {
    DIALOG_ENTRY_DESCRIPTION,
    EntryAnnotationDescriptionButton,
    MAX_ENTRY_DESCRIPTION_LENGTH,
    openDialogEntryAnnotationDescription,
} from 'ui/components/DialogEntryDescription';
import {updateDialogProps} from 'ui/store/actions/dialog';
import {FieldKey} from 'ui/units/connections/constants';

import {
    isConnectionDescriptionChangedSelector,
    pageLoadingSelector,
    readonlySelector,
    selectConnectionDescription,
    setForm,
} from '../../../store';

const i18n = I18n.keyset('connections.form');

export const DescriptionButton = () => {
    const dispatch = useDispatch();
    const canEdit = !useSelector(readonlySelector);
    const description = useSelector(selectConnectionDescription);
    const isDescriptionChanged = useSelector(isConnectionDescriptionChangedSelector);
    const isPageLoading = useSelector(pageLoadingSelector);

    const handleOnApplyClick = React.useCallback(
        (text: string) => {
            dispatch(setForm({updates: {[FieldKey.Description]: text}}));
        },
        [dispatch],
    );

    const handleEditClick = React.useCallback(() => {
        dispatch(
            updateDialogProps({
                id: DIALOG_ENTRY_DESCRIPTION,
                props: {
                    title: i18n('label_connection-info'),
                    description: description || '',
                    isEditMode: true,
                    canEdit: true,
                    onApply: handleOnApplyClick,
                    maxLength: MAX_ENTRY_DESCRIPTION_LENGTH,
                },
            }),
        );
    }, [description, dispatch, handleOnApplyClick]);

    const handleDescriptionClick = React.useCallback(() => {
        dispatch(
            openDialogEntryAnnotationDescription({
                title: i18n('label_connection-info'),
                description: description || '',
                canEdit,
                onEdit: handleEditClick,
                isEditMode: canEdit && (!description || isDescriptionChanged),
                onApply: handleOnApplyClick,
            }),
        );
    }, [dispatch, description, canEdit, handleEditClick, isDescriptionChanged, handleOnApplyClick]);

    if (isPageLoading) {
        return null;
    }

    return (
        <EntryAnnotationDescriptionButton
            description={description}
            isEditMode={canEdit}
            onClick={handleDescriptionClick}
        />
    );
};
