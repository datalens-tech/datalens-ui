import React from 'react';

import {Button, Icon} from '@gravity-ui/uikit';
import {EntryDialogName} from 'components/EntryDialogues';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import EntryDialogues from '../../../../../components/EntryDialogues/EntryDialogues';
import {Mode} from '../../../modules/constants';
import {setDashDescViewMode, setDashDescription} from '../../../store/actions/dashTyped';
import {isEditMode} from '../../../store/selectors/dash';
import {
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
};

export const Description = (props: DescriptionProps) => {
    const {canEdit, entryDialoguesRef, onEditClick} = props;

    const dispatch = useDispatch();
    const isDashEditMode = useSelector(isEditMode);
    const description = useSelector(selectDashDescription);
    const descriptionMode = useSelector(selectDashDescMode);

    const handleOnApplyClick = React.useCallback(
        (text: string) => {
            dispatch(setDashDescription(text));
            dispatch(setDashDescViewMode(Mode.View));
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
        if (descriptionMode !== Mode.Edit || !isDashEditMode) {
            return;
        }
        entryDialoguesRef.current?.open?.({
            dialog: EntryDialogName.DashMeta,
            dialogProps: {
                title: i18n('label_dash-info'),
                text: description || '',
                canEdit,
                onCancel: handleOnCancelClick,
                isEditMode: true,
                onApply: handleOnApplyClick,
            },
        });

        return () => {
            dispatch(setDashDescViewMode(Mode.View));
        };
    }, [
        dispatch,
        entryDialoguesRef,
        description,
        canEdit,
        descriptionMode,
        isDashEditMode,
        handleOnCancelClick,
        handleOnApplyClick,
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
