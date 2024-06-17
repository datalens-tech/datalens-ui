import React from 'react';

import {
    ArrowUturnCcwLeft,
    ArrowUturnCwRight,
    ChevronsCollapseUpRight,
    ChevronsExpandUpRight,
} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useHotkeys} from 'react-hotkeys-hook';
import {useDispatch} from 'react-redux';

import {Feature, WizardPageQa} from '../../../../../../shared';
import type {AdditionalButtonTemplate} from '../../../../../components/ActionPanel/components/ChartSaveControls/types';
import type {ChartKit} from '../../../../../libs/DatalensChartkit/ChartKit/ChartKit';
import {goBack, goForward} from '../../../../../store/actions/editHistory';
import Utils, {isMacintosh} from '../../../../../utils';
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
        chartKitRef,
        isFullscreen,
        canGoBack,
        canGoForward,
    } = args;

    const enableEditHistory = Utils.isEnabledFeature(Feature.EnableEditHistory);

    const onClickGoBack = () => {
        dispatch(goBack({unitId: WIZARD_EDIT_HISTORY_UNIT_ID}));
    };

    const onClickGoForward = () => {
        dispatch(goForward({unitId: WIZARD_EDIT_HISTORY_UNIT_ID}));
    };

    let undoHotkey;
    let redoHotkey;

    if (isMacintosh()) {
        undoHotkey = 'meta+z';
        redoHotkey = 'meta+shift+z';
    } else {
        undoHotkey = 'ctrl+z';
        redoHotkey = 'ctrl+shift+z';
    }

    useHotkeys(undoHotkey, onClickGoBack, {scopes: 'wizard'});
    useHotkeys(redoHotkey, onClickGoForward, {scopes: 'wizard'});

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, chartKitRef.current, isFullscreen, canGoBack, canGoForward]);

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
