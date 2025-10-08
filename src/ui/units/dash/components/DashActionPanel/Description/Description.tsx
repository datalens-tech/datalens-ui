import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {
    DIALOG_ENTRY_DESCRIPTION,
    EntryAnnotationDescriptionButton,
    MAX_ENTRY_DESCRIPTION_LENGTH,
    openDialogEntryAnnotationDescription,
} from 'ui/components/DialogEntryDescription';
import {URL_QUERY} from 'ui/constants/common';
import {closeDialog, updateDialogProps} from 'ui/store/actions/dialog';

import {updateDashOpenedDesc, updateDescription} from '../../../store/actions/dashTyped';
import {isEditMode, selectDashDescription} from '../../../store/selectors/dashTypedSelectors';

import '../DashActionPanel.scss';

const i18n = I18n.keyset('dash.action-panel.view');

type DescriptionProps = {
    canEdit: boolean;
    onEditClick?: (onConfirmCallback?: () => void, onCancelCallback?: () => void) => void;
    showOpenedDescription: boolean;
    iconSize?: number;
};

export const Description = (props: DescriptionProps) => {
    const {canEdit, onEditClick, showOpenedDescription, iconSize = 20} = props;

    const history = useHistory();

    const dispatch = useDispatch();
    const isDashEditMode = useSelector(isEditMode);
    const description = useSelector(selectDashDescription);

    const handleOnApplyClick = React.useCallback(
        (text: string) => {
            dispatch(updateDescription(text));
        },
        [dispatch],
    );

    const handleOnClose = React.useCallback(() => {
        const searchParams = new URLSearchParams(history.location.search);
        searchParams.delete(URL_QUERY.OPEN_DASH_INFO);
        history.push({
            ...history.location,
            search: `?${searchParams.toString()}`,
        });

        dispatch(updateDashOpenedDesc(false));
    }, [history, dispatch]);

    const handleOnEditClick = React.useCallback(() => {
        onEditClick?.(
            () => {
                dispatch(
                    updateDialogProps({
                        id: DIALOG_ENTRY_DESCRIPTION,
                        props: {
                            title: i18n('label_dash-info'),
                            description: description || '',
                            canEdit,
                            isEditMode: true,
                            onApply: handleOnApplyClick,
                            onCloseCallback: handleOnClose,
                            maxLength: MAX_ENTRY_DESCRIPTION_LENGTH,
                        },
                    }),
                );
            },
            () => dispatch(closeDialog()),
        );
    }, [canEdit, description, dispatch, handleOnApplyClick, handleOnClose, onEditClick]);

    const openEntryDescriptionDialog = React.useCallback(() => {
        dispatch(
            openDialogEntryAnnotationDescription({
                title: i18n('label_dash-info'),
                description: description || '',
                canEdit,
                onEdit: handleOnEditClick,
                isEditMode: isDashEditMode,
                onApply: handleOnApplyClick,
                onCloseCallback: handleOnClose,
            }),
        );
    }, [
        dispatch,
        description,
        canEdit,
        handleOnEditClick,
        isDashEditMode,
        handleOnApplyClick,
        handleOnClose,
    ]);

    // open meta info dialog in edit mode when switches to dash edit mode
    React.useEffect(() => {
        const needOpenDialog = showOpenedDescription && description;

        if (needOpenDialog) {
            openEntryDescriptionDialog();
        }
    }, [openEntryDescriptionDialog, description, showOpenedDescription]);

    return (
        <EntryAnnotationDescriptionButton
            onClick={openEntryDescriptionDialog}
            description={description}
            isEditMode={isDashEditMode}
            size={iconSize}
        />
    );
};
