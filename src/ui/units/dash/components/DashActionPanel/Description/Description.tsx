import React from 'react';

import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {
    DIALOG_ENTRY_DESCRIPTION,
    EntryDescriptionButton,
} from 'ui/components/DialogEntryDescription';
import {URL_QUERY} from 'ui/constants/common';
import {openDialog} from 'ui/store/actions/dialog';

import type EntryDialogues from '../../../../../components/EntryDialogues/EntryDialogues';
import {Mode} from '../../../modules/constants';
import {
    setDashDescViewMode,
    updateDashOpenedDesc,
    updateDescription,
} from '../../../store/actions/dashTyped';
import {
    isEditMode,
    selectDashDescMode,
    selectDashDescription,
} from '../../../store/selectors/dashTypedSelectors';

import '../DashActionPanel.scss';

const i18n = I18n.keyset('dash.action-panel.view');

type DescriptionProps = {
    canEdit: boolean;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
    onEditClick?: () => void;
    showOpenedDescription: boolean;
};

export const Description = (props: DescriptionProps) => {
    const {canEdit, entryDialoguesRef, onEditClick, showOpenedDescription} = props;

    const history = useHistory();

    const dispatch = useDispatch();
    const isDashEditMode = useSelector(isEditMode);
    const description = useSelector(selectDashDescription);
    const descriptionMode = useSelector(selectDashDescMode);

    const handleOnApplyClick = React.useCallback(
        (text: string) => {
            dispatch(updateDescription(text));
        },
        [dispatch],
    );

    const handleOnCancelClick = React.useCallback(() => {
        dispatch(setDashDescViewMode(Mode.View));
    }, [dispatch]);

    const handleOnEditClick = React.useCallback(() => {
        onEditClick?.();
        dispatch(setDashDescViewMode(Mode.Edit));
    }, [dispatch, onEditClick]);

    const handleOnClose = React.useCallback(() => {
        const searchParams = new URLSearchParams(history.location.search);
        searchParams.delete(URL_QUERY.OPEN_DASH_INFO);
        history.push({
            ...history.location,
            search: `?${searchParams.toString()}`,
        });

        dispatch(updateDashOpenedDesc(false));
        dispatch(setDashDescViewMode(Mode.View));
    }, [history, dispatch]);

    const handleDescriptionClick = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_ENTRY_DESCRIPTION,
                props: {
                    title: i18n('label_dash-info'),
                    description: description || '',
                    canEdit,
                    onEdit: handleOnEditClick,
                    onCancel: handleOnCancelClick,
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
        handleOnCancelClick,
        handleOnApplyClick,
        isDashEditMode,
        handleOnClose,
    ]);

    // open meta info dialog in edit mode when switches to dash edit mode
    React.useEffect(() => {
        const needOpenDialog =
            (showOpenedDescription && description) ||
            !(descriptionMode !== Mode.Edit || !isDashEditMode);

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
                    onCancel: handleOnCancelClick,
                    isEditMode: isDashEditMode,
                    onApply: handleOnApplyClick,
                    onCloseCallback: handleOnClose,
                },
            }),
        );
    }, [
        dispatch,
        entryDialoguesRef,
        description,
        canEdit,
        descriptionMode,
        isDashEditMode,
        handleOnEditClick,
        handleOnCancelClick,
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
