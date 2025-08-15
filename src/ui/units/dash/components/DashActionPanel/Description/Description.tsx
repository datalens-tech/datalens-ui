import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import {EntryDialogName} from 'components/EntryDialogues';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {URL_QUERY} from 'ui/constants/common';

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

import iconDescription from 'assets/icons/info.svg';

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
        entryDialoguesRef.current?.open?.({
            dialog: EntryDialogName.DashMeta,
            dialogProps: {
                title: i18n('label_dash-info'),
                text: description || '',
                canEdit,
                onEdit: handleOnEditClick,
                onCancel: handleOnCancelClick,
                isEditMode: isDashEditMode,
                onApply: handleOnApplyClick,
                onCloseCallback: handleOnClose,
            },
        });
    }, [
        entryDialoguesRef,
        description,
        canEdit,
        handleOnEditClick,
        handleOnCancelClick,
        handleOnApplyClick,
        isDashEditMode,
    ]);

    // open meta info dialog in edit mode when switches to dash edit mode
    React.useEffect(() => {
        const needOpenDialog =
            (showOpenedDescription && description) ||
            !(descriptionMode !== Mode.Edit || !isDashEditMode);

        if (!needOpenDialog) {
            return;
        }

        entryDialoguesRef.current?.open?.({
            dialog: EntryDialogName.DashMeta,
            dialogProps: {
                title: i18n('label_dash-info'),
                text: description || '',
                canEdit,
                onEdit: handleOnEditClick,
                onCancel: handleOnCancelClick,
                isEditMode: isDashEditMode,
                onApply: handleOnApplyClick,
                onCloseCallback: handleOnClose,
            },
        });
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

    if (!isDashEditMode && !description) {
        return null;
    }

    return (
        <Button
            view="flat"
            size="m"
            onClick={handleDescriptionClick}
            qa="action-button-description"
        >
            <Icon data={iconDescription} width={20} height={20} />
        </Button>
    );
};
