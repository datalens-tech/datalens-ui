import React from 'react';

import {ChevronsCollapseUpRight, ChevronsExpandUpRight} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch} from 'react-redux';

import {AdditionalButtonTemplate} from '../../../../../components/ActionPanel/components/ChartSaveControls/types';
import type {ChartKit} from '../../../../../libs/DatalensChartkit/ChartKit/ChartKit';
import {toggleFullscreen} from '../../../actions/settings';

const b = block('wizard-action-panel');

export type UseWizardActionPanelArgs = {
    handleEditButtonClick: () => void;
    editButtonLoading: boolean;
    isViewOnlyMode: boolean;
    chartKitRef: React.RefObject<ChartKit>;
    isFullscreen: boolean;
};

export const useWizardActionPanel = (
    args: UseWizardActionPanelArgs,
): AdditionalButtonTemplate[] => {
    const dispatch = useDispatch();

    const {editButtonLoading, handleEditButtonClick, isViewOnlyMode, chartKitRef, isFullscreen} =
        args;

    const defaultButtons: AdditionalButtonTemplate[] = React.useMemo<
        AdditionalButtonTemplate[]
    >(() => {
        const iconFullScreenData = {
            data: isFullscreen ? ChevronsCollapseUpRight : ChevronsExpandUpRight,
            size: 16,
        };

        return [
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
    }, [dispatch, chartKitRef.current, isFullscreen]);

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
