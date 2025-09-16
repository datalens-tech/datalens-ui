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

import {setDatasetDescription} from '../../store/actions/creators';
import {
    datasetDescrioptionSelector,
    datasetPermissionsSelector,
    isDescriptionChangedSelector,
} from '../../store/selectors';

const i18n = I18n.keyset('dataset.dataset-editor.modify');

export const DescriptionButton = () => {
    const dispatch = useDispatch();
    const description = useSelector(datasetDescrioptionSelector);
    const isDescriptionChanged = useSelector(isDescriptionChangedSelector);

    const permissions = useSelector(datasetPermissionsSelector);
    const canEdit = Boolean(permissions?.edit);

    const handleOnApplyClick = React.useCallback(
        (text: string) => {
            dispatch(setDatasetDescription(text));
        },
        [dispatch],
    );

    const handleEditClick = React.useCallback(() => {
        dispatch(
            updateDialogProps({
                id: DIALOG_ENTRY_DESCRIPTION,
                props: {
                    title: i18n('label_dataset-info'),
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
                title: i18n('label_dataset-info'),
                description: description || '',
                canEdit,
                onEdit: handleEditClick,
                isEditMode: canEdit && (!description || isDescriptionChanged),
                onApply: handleOnApplyClick,
            }),
        );
    }, [dispatch, description, canEdit, handleEditClick, isDescriptionChanged, handleOnApplyClick]);

    return (
        <EntryAnnotationDescriptionButton isEditMode={canEdit} onClick={handleDescriptionClick} />
    );
};
