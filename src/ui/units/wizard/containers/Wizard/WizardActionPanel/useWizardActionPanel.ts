import React from 'react';

import {
    ArrowUturnCcwLeft,
    ArrowUturnCwRight,
    ChevronsCollapseUpRight,
    ChevronsExpandUpRight,
    CircleInfo,
} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {WizardPageQa} from '../../../../../../shared';
import type {AdditionalButtonTemplate} from '../../../../../components/ActionPanel/components/ChartSaveControls/types';
import {openDialogEntryAnnotationDescription} from '../../../../../components/DialogEntryDescription';
import {HOTKEYS_SCOPES, REDO_HOTKEY, UNDO_HOTKEY} from '../../../../../constants/misc';
import {useBindHotkey} from '../../../../../hooks/useBindHotkey';
import {goBack, goForward} from '../../../../../store/actions/editHistory';
import {setDescription} from '../../../actions/preview';
import {toggleFullscreen} from '../../../actions/settings';
import {WIZARD_EDIT_HISTORY_UNIT_ID} from '../../../constants';
import {selectIsDescriptionChanged, selectPreviewDescription} from '../../../selectors/preview';

const b = block('wizard-action-panel');

export type UseWizardActionPanelArgs = {
    handleEditButtonClick: () => void;
    editButtonLoading: boolean;
    isViewOnlyMode: boolean;
    isFullscreen: boolean;
    canGoBack: boolean | null;
    canGoForward: boolean | null;
    canEdit: boolean;
};

export const useWizardActionPanel = (
    args: UseWizardActionPanelArgs,
): AdditionalButtonTemplate[] => {
    const dispatch = useDispatch();
    const description = useSelector(selectPreviewDescription);
    const isDescriptionChanged = useSelector(selectIsDescriptionChanged);

    const {
        editButtonLoading,
        handleEditButtonClick,
        isViewOnlyMode,
        isFullscreen,
        canGoBack,
        canGoForward,
        canEdit,
    } = args;

    const onClickGoBack = React.useCallback(() => {
        if (canGoBack) {
            dispatch(goBack({unitId: WIZARD_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoBack, dispatch]);

    const onClickGoForward = React.useCallback(() => {
        if (canGoForward) {
            dispatch(goForward({unitId: WIZARD_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoForward, dispatch]);

    const handleApplyDescriptionClick = React.useCallback(
        (text: string) => {
            dispatch(setDescription(text));
        },
        [dispatch],
    );

    const handleEditDescriptionClick = React.useCallback(() => {
        dispatch(
            openDialogEntryAnnotationDescription({
                title: i18n('wizard', 'label_wizard-info'),
                description: description || '',
                isEditMode: true,
                onApply: handleApplyDescriptionClick,
            }),
        );
    }, [description, dispatch, handleApplyDescriptionClick]);

    const handleDescriptionClick = React.useCallback(() => {
        dispatch(
            openDialogEntryAnnotationDescription({
                title: i18n('wizard', 'label_wizard-info'),
                description: description || '',
                canEdit,
                onEdit: handleEditDescriptionClick,
                isEditMode: canEdit && (!description || isDescriptionChanged),
                onApply: handleApplyDescriptionClick,
            }),
        );
    }, [
        description,
        dispatch,
        handleApplyDescriptionClick,
        handleEditDescriptionClick,
        isDescriptionChanged,
        canEdit,
    ]);

    useBindHotkey({
        key: UNDO_HOTKEY,
        handler: onClickGoBack,
        options: {scopes: HOTKEYS_SCOPES.WIZARD},
    });

    useBindHotkey({
        key: REDO_HOTKEY,
        handler: onClickGoForward,
        options: {scopes: HOTKEYS_SCOPES.WIZARD},
    });

    const defaultButtons: AdditionalButtonTemplate[] = React.useMemo<
        AdditionalButtonTemplate[]
    >(() => {
        const iconFullScreenData = {
            data: isFullscreen ? ChevronsCollapseUpRight : ChevronsExpandUpRight,
            size: 16,
        };

        const items: AdditionalButtonTemplate[] = [
            {
                key: 'undo',
                action: onClickGoBack,
                className: b('undo-btn'),
                icon: {data: ArrowUturnCcwLeft, size: 16},
                view: 'flat',
                disabled: !canGoBack,
                qa: WizardPageQa.UndoButton,
                title: i18n('component.action-panel.view', 'button_undo'),
                hotkey: UNDO_HOTKEY.join('+'),
            },
            {
                key: 'redo',
                action: onClickGoForward,
                className: b('redo-btn'),
                icon: {data: ArrowUturnCwRight, size: 16},
                view: 'flat',
                disabled: !canGoForward,
                qa: WizardPageQa.RedoButton,
                title: i18n('component.action-panel.view', 'button_redo'),
                hotkey: REDO_HOTKEY.join('+'),
            },
            {
                key: 'fullscreen',
                action: () => {
                    dispatch(toggleFullscreen());
                },
                text: i18n('wizard', 'button_toggle-fullscreen'),
                textClassName: b('fullscreen-btn-text'),
                icon: iconFullScreenData,
                view: 'flat',
            },
        ];

        if (canEdit || description) {
            items.push({
                key: 'description',
                action: handleDescriptionClick,
                icon: {data: CircleInfo, size: 16},
                view: 'flat',
                className: b('description-btn'),
            });
        }

        return items;
    }, [
        isFullscreen,
        onClickGoBack,
        canGoBack,
        onClickGoForward,
        canGoForward,
        canEdit,
        description,
        dispatch,
        handleDescriptionClick,
    ]);

    const viewOnlyModeButtons: AdditionalButtonTemplate[] = React.useMemo<
        AdditionalButtonTemplate[]
    >(() => {
        const descriptionButton: AdditionalButtonTemplate[] = description
            ? [
                  {
                      key: 'description',
                      action: handleDescriptionClick,
                      icon: {data: CircleInfo, size: 16},
                      view: 'flat',
                      className: b('description-btn'),
                  },
              ]
            : [];

        return [
            ...descriptionButton,
            {
                key: 'action-panel-edit-button',
                loading: editButtonLoading,
                text: i18n('wizard', 'button_edit-built-in'),
                action: handleEditButtonClick,
                view: 'action',
            },
        ];
    }, [description, editButtonLoading, handleDescriptionClick, handleEditButtonClick]);

    return isViewOnlyMode ? viewOnlyModeButtons : defaultButtons;
};
