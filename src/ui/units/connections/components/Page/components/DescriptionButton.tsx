import React from 'react';

import {spacing} from '@gravity-ui/uikit';
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
    formSchemaSelector,
    isConnectionDescriptionChangedSelector,
    pageLoadingSelector,
    readonlySelector,
    selectConnectionDescription,
    setForm,
} from '../../../store';

const i18n = I18n.keyset('connections.form');

export const DescriptionButton = ({isS3BasedConnForm}: {isS3BasedConnForm: boolean}) => {
    const dispatch = useDispatch();
    const readonly = useSelector(readonlySelector);
    const description = useSelector(selectConnectionDescription);
    const isDescriptionChanged = useSelector(isConnectionDescriptionChangedSelector);
    const isPageLoading = useSelector(pageLoadingSelector);

    const schema = useSelector(formSchemaSelector);
    const apiSchema = schema?.apiSchema;

    const canEdit = !readonly && Boolean(apiSchema?.create || apiSchema?.edit || isS3BasedConnForm);
    const hidden = !isS3BasedConnForm && !schema;

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

    if (isPageLoading || hidden) {
        return null;
    }

    return (
        <EntryAnnotationDescriptionButton
            className={spacing({mr: 2})}
            description={description}
            isEditMode={canEdit}
            onClick={handleDescriptionClick}
        />
    );
};
