import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {
    DIALOG_ENTRY_DESCRIPTION,
    EntryDescriptionButton,
} from 'ui/components/DialogEntryDescription';
import type {EntryDialogues} from 'ui/components/EntryDialogues';
import {URL_QUERY} from 'ui/constants/common';
import {closeDialog, openDialog} from 'ui/store/actions/dialog';

import {updateDashOpenedDesc, updateDescription} from '../../../store/actions/dashTyped';
import {isEditMode, selectDashDescription} from '../../../store/selectors/dashTypedSelectors';

import '../DashActionPanel.scss';

const i18n = I18n.keyset('dash.action-panel.view');

type DescriptionProps = {
    canEdit: boolean;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    onEditClick?: (onConfirmCallback?: () => void) => void;
    showOpenedDescription: boolean;
};

export const Description = (props: DescriptionProps) => {
    const {canEdit, onEditClick, showOpenedDescription} = props;

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
        onEditClick?.(() => {
            dispatch(closeDialog());
            dispatch(
                openDialog({
                    id: DIALOG_ENTRY_DESCRIPTION,
                    props: {
                        title: i18n('label_dash-info'),
                        description: description || '',
                        canEdit,
                        isEditMode: true,
                        onApply: handleOnApplyClick,
                        onCloseCallback: handleOnClose,
                    },
                }),
            );
        });
    }, [canEdit, description, dispatch, handleOnApplyClick, handleOnClose, onEditClick]);

    const handleDescriptionClick = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_ENTRY_DESCRIPTION,
                props: {
                    title: i18n('label_dash-info'),
                    description: description || '',
                    canEdit,
                    onEdit: handleOnEditClick,
                    isEditMode: isDashEditMode,
                    onApply: handleOnApplyClick,
                    onCloseCallback: handleOnClose,
                },
            }),
        );
    }, [
        dispatch,
        description,
        canEdit,
        handleOnEditClick,
        handleOnApplyClick,
        isDashEditMode,
        handleOnClose,
    ]);

    // open meta info dialog in edit mode when switches to dash edit mode
    React.useEffect(() => {
        const needOpenDialog = showOpenedDescription && description;

        if (!needOpenDialog) {
            return;
        }

        dispatch(
            openDialog({
                id: DIALOG_ENTRY_DESCRIPTION,
                props: {
                    title: i18n('label_dash-info'),
                    description: description || '',
                    canEdit,
                    onEdit: handleOnEditClick,
                    isEditMode: isDashEditMode,
                    onApply: handleOnApplyClick,
                    onCloseCallback: handleOnClose,
                },
            }),
        );
    }, [
        dispatch,
        description,
        canEdit,
        isDashEditMode,
        handleOnEditClick,
        handleOnApplyClick,
        showOpenedDescription,
        handleOnClose,
    ]);

    return (
        <EntryDescriptionButton
            onClick={handleDescriptionClick}
            description={description}
            isEditMode={isDashEditMode}
        />
    );
};
