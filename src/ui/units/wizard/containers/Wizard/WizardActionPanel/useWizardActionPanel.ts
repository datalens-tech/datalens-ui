import React from 'react';

import {
    ArrowUturnCcwLeft,
    ArrowUturnCwRight,
    ChevronsCollapseUpRight,
    ChevronsExpandUpRight,
} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch} from 'react-redux';

import {WizardPageQa} from '../../../../../../shared';
import type {AdditionalButtonTemplate} from '../../../../../components/ActionPanel/components/ChartSaveControls/types';
import {HOTKEYS_SCOPES, REDO_HOTKEY, UNDO_HOTKEY} from '../../../../../constants/misc';
import {useBindHotkey} from '../../../../../hooks/useBindHotkey';
import {goBack, goForward} from '../../../../../store/actions/editHistory';
import {toggleFullscreen} from '../../../actions/settings';
import {WIZARD_EDIT_HISTORY_UNIT_ID} from '../../../constants';

const b = block('wizard-action-panel');

export type UseWizardActionPanelArgs = {
    handleEditButtonClick: () => void;
    editButtonLoading: boolean;
    isViewOnlyMode: boolean;
    isFullscreen: boolean;
    canGoBack: boolean | null;
    canGoForward: boolean | null;
};

export const useWizardActionPanel = (
    args: UseWizardActionPanelArgs,
): AdditionalButtonTemplate[] => {
    const dispatch = useDispatch();

    const {
        editButtonLoading,
        handleEditButtonClick,
        isViewOnlyMode,
        isFullscreen,
        canGoBack,
        canGoForward,
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
        ];

        return [
            ...items,
            {
                key: 'fullscreen',
                action: () => {
                    dispatch(toggleFullscreen());
                },
                text: i18n('wizard', 'button_toggle-fullscreen'),
                textClassName: b('fullscreen-btn-text'),
                className: b('fullscreen-btn'),
                icon: iconFullScreenData,
                view: 'flat',
            },
        ];
    }, [isFullscreen, onClickGoBack, canGoBack, onClickGoForward, canGoForward, dispatch]);

    const editButton: AdditionalButtonTemplate[] = React.useMemo<AdditionalButtonTemplate[]>(() => {
        return [
            {
                key: 'action-panel-edit-button',
                loading: editButtonLoading,
                text: i18n('wizard', 'button_edit-built-in'),
                action: handleEditButtonClick,
                view: 'action',
            },
        ];
    }, [editButtonLoading, handleEditButtonClick]);

    return isViewOnlyMode ? editButton : defaultButtons;
};
