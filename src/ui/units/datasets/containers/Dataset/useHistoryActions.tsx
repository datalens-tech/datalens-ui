import React from 'react';

import {HOTKEYS_SCOPES} from 'ui/constants/misc';
import {useEditHistoryActions} from 'ui/hooks/useEditHistoryActions';
import type {DatalensGlobalState} from 'ui/index';
import {selectCanGoBack, selectCanGoForward} from 'ui/store/selectors/editHistory';
import {openModalSubscriber} from 'ui/utils';

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
    const [disabled, setDisabled] = React.useState(false);

    React.useEffect(() => {
        const unsubscribe = openModalSubscriber(setDisabled);
        return unsubscribe;
    }, []);

    return useEditHistoryActions({
        unitId: DATASETS_EDIT_HISTORY_UNIT_ID,
        hotkeyScope: HOTKEYS_SCOPES.DATASETS,
        canGoBackSelector,
        canGoForwardSelector,
        iconSize: ACTION_PANEL_ICON_SIZE,
        disabled,
    });
}
