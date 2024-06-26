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

import {Feature, WizardPageQa} from '../../../../../../shared';
import type {AdditionalButtonTemplate} from '../../../../../components/ActionPanel/components/ChartSaveControls/types';
import {REDO_HOTKEY, UNDO_HOTKEY} from '../../../../../constants/misc';
import {useBindHotkey} from '../../../../../hooks/useBindHotkey';
import type {ChartKit} from '../../../../../libs/DatalensChartkit/ChartKit/ChartKit';
import {goBack, goForward} from '../../../../../store/actions/editHistory';
import Utils from '../../../../../utils';
import {toggleFullscreen} from '../../../actions/settings';
import {WIZARD_EDIT_HISTORY_UNIT_ID} from '../../../constants';

const b = block('wizard-action-panel');

export type UseWizardActionPanelArgs = {
    handleEditButtonClick: () => void;
    editButtonLoading: boolean;
    isViewOnlyMode: boolean;
    chartKitRef: React.RefObject<ChartKit>;
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

    const enableEditHistory = Utils.isEnabledFeature(Feature.EnableEditHistory);

    const onClickGoBack = React.useCallback(() => {
        if (canGoBack && enableEditHistory) {
            dispatch(goBack({unitId: WIZARD_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoBack, dispatch, enableEditHistory]);

    const onClickGoForward = React.useCallback(() => {
        if (canGoForward && enableEditHistory) {
            dispatch(goForward({unitId: WIZARD_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoForward, dispatch, enableEditHistory]);

    useBindHotkey({
        key: UNDO_HOTKEY,
        handler: onClickGoBack,
        options: {scopes: 'wizard'},
    });

    useBindHotkey({
        key: REDO_HOTKEY,
        handler: onClickGoForward,
        options: {scopes: 'wizard'},
    });

    const defaultButtons: AdditionalButtonTemplate[] = React.useMemo<
        AdditionalButtonTemplate[]
    >(() => {
        const iconFullScreenData = {
            data: isFullscreen ? ChevronsCollapseUpRight : ChevronsExpandUpRight,
            size: 16,
        };

        let items: AdditionalButtonTemplate[] = [];

        if (enableEditHistory) {
            items = [
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
        }

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
    }, [
        isFullscreen,
        enableEditHistory,
        onClickGoBack,
        canGoBack,
        onClickGoForward,
        canGoForward,
        dispatch,
    ]);

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
