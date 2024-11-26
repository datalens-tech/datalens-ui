import React from 'react';

import {ArrowUturnCcwLeft, ArrowUturnCwRight} from '@gravity-ui/icons';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Feature} from 'shared';
import type {AdditionalButtonTemplate} from 'ui/components/ActionPanel/components/ChartSaveControls/types';
import {useAdditionalItems} from 'ui/components/ActionPanel/components/ChartSaveControls/useAdditionalItems';
import {HOTKEYS_SCOPES, REDO_HOTKEY, UNDO_HOTKEY} from 'ui/constants/misc';
import {useBindHotkey} from 'ui/hooks/useBindHotkey';
import type {DatalensGlobalState} from 'ui/index';
import {goBack, goForward} from 'ui/store/actions/editHistory';
import {selectCanGoBack, selectCanGoForward} from 'ui/store/selectors/editHistory';
import Utils from 'ui/utils';

import {DATASETS_EDIT_HISTORY_UNIT_ID} from '../../constants';

import {ACTION_PANEL_ICON_SIZE} from './constants';

const canGoBackSelector = (state: DatalensGlobalState) => {
    const isValidationPending =
        state.dataset.savingDataset.disabled && state.dataset.ui.isDatasetChanged;

    return (
        !isValidationPending &&
        !state.dataset.validation.isLoading &&
        selectCanGoBack(state, {unitId: DATASETS_EDIT_HISTORY_UNIT_ID})
    );
};

const canGoForwardSelector = (state: DatalensGlobalState) => {
    const isValidationPending =
        state.dataset.savingDataset.disabled && state.dataset.ui.isDatasetChanged;

    return (
        !isValidationPending &&
        !state.dataset.validation.isLoading &&
        selectCanGoForward(state, {unitId: DATASETS_EDIT_HISTORY_UNIT_ID})
    );
};

export function useHistoryActions() {
    const dispatch = useDispatch();
    const featureEnabled = Utils.isEnabledFeature(Feature.EnableEditHistoryDatasets);
    const canGoBack = useSelector(canGoBackSelector);
    const canGoForward = useSelector(canGoForwardSelector);

    const handleGoBack = React.useCallback(() => {
        if (canGoBack) {
            dispatch(goBack({unitId: DATASETS_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoBack, dispatch]);

    const handleGoForward = React.useCallback(() => {
        if (canGoForward) {
            dispatch(goForward({unitId: DATASETS_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoForward, dispatch]);

    const items: AdditionalButtonTemplate[] = React.useMemo(() => {
        if (!featureEnabled) {
            return [];
        }

        return [
            {
                key: 'undo',
                action: handleGoBack,
                icon: {data: ArrowUturnCcwLeft, size: ACTION_PANEL_ICON_SIZE},
                view: 'flat',
                disabled: !canGoBack,
                title: i18n('component.action-panel.view', 'button_undo'),
                hotkey: UNDO_HOTKEY.join('+'),
            },
            {
                key: 'redo',
                action: handleGoForward,
                icon: {data: ArrowUturnCwRight, size: ACTION_PANEL_ICON_SIZE},
                view: 'flat',
                disabled: !canGoForward,
                title: i18n('component.action-panel.view', 'button_redo'),
                hotkey: REDO_HOTKEY.join('+'),
            },
        ];
    }, [canGoBack, canGoForward, featureEnabled, handleGoBack, handleGoForward]);
    const actions = useAdditionalItems({items});

    useBindHotkey({
        key: UNDO_HOTKEY,
        handler: handleGoBack,
        options: {enabled: featureEnabled && canGoBack, scopes: HOTKEYS_SCOPES.DATASETS},
    });
    useBindHotkey({
        key: REDO_HOTKEY,
        handler: handleGoForward,
        options: {enabled: featureEnabled && canGoForward, scopes: HOTKEYS_SCOPES.DATASETS},
    });

    return actions;
}
