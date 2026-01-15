import React from 'react';

import {ArrowUturnCcwLeft, ArrowUturnCwRight} from '@gravity-ui/icons';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {AdditionalButtonTemplate} from 'ui/components/ActionPanel/components/ChartSaveControls/types';
import {useAdditionalItems} from 'ui/components/ActionPanel/components/ChartSaveControls/useAdditionalItems';
import {REDO_HOTKEY, UNDO_HOTKEY} from 'ui/constants/misc';
import {useBindHotkey} from 'ui/hooks/useBindHotkey';
import type {DatalensGlobalState} from 'ui/index';
import {goBack, goForward} from 'ui/store/actions/editHistory';
import {selectCanGoBack, selectCanGoForward} from 'ui/store/selectors/editHistory';

export interface UseEditHistoryActionsOptions {
    unitId: string;
    hotkeyScope: string;
    canGoBackSelector?: (state: DatalensGlobalState) => boolean;
    canGoForwardSelector?: (state: DatalensGlobalState) => boolean;
    iconSize?: number;
    disabled?: boolean;
}

const ACTION_PANEL_ICON_SIZE = 16;
const i18n = I18n.keyset('component.action-panel.view');

export function useEditHistoryActions(options: UseEditHistoryActionsOptions) {
    const {
        unitId,
        hotkeyScope,
        canGoBackSelector: customCanGoBackSelector,
        canGoForwardSelector: customCanGoForwardSelector,
        iconSize = ACTION_PANEL_ICON_SIZE,
        disabled = false,
    } = options;

    const dispatch = useDispatch();

    const defaultCanGoBackSelector = React.useCallback(
        (state: DatalensGlobalState) => !disabled && selectCanGoBack(state, {unitId}),
        [disabled, unitId],
    );

    const defaultCanGoForwardSelector = React.useCallback(
        (state: DatalensGlobalState) => !disabled && selectCanGoForward(state, {unitId}),
        [disabled, unitId],
    );

    const canGoBack = useSelector(customCanGoBackSelector || defaultCanGoBackSelector);
    const canGoForward = useSelector(customCanGoForwardSelector || defaultCanGoForwardSelector);

    const handleGoBack = React.useCallback(() => {
        if (canGoBack) {
            dispatch(goBack({unitId}));
        }
    }, [canGoBack, dispatch, unitId]);

    const handleGoForward = React.useCallback(() => {
        if (canGoForward) {
            dispatch(goForward({unitId}));
        }
    }, [canGoForward, dispatch, unitId]);

    const items: AdditionalButtonTemplate[] = React.useMemo(() => {
        return [
            {
                key: 'undo',
                action: handleGoBack,
                icon: {data: ArrowUturnCcwLeft, size: iconSize},
                view: 'flat',
                disabled: !canGoBack,
                title: i18n('button_undo'),
                hotkey: UNDO_HOTKEY.join('+'),
            },
            {
                key: 'redo',
                action: handleGoForward,
                icon: {data: ArrowUturnCwRight, size: iconSize},
                view: 'flat',
                disabled: !canGoForward,
                title: i18n('button_redo'),
                hotkey: REDO_HOTKEY.join('+'),
            },
        ];
    }, [canGoBack, canGoForward, handleGoBack, handleGoForward, iconSize]);

    const actions = useAdditionalItems({items});

    useBindHotkey({
        key: UNDO_HOTKEY,
        handler: handleGoBack,
        options: {enabled: !disabled && canGoBack, scopes: hotkeyScope},
    });

    useBindHotkey({
        key: REDO_HOTKEY,
        handler: handleGoForward,
        options: {enabled: !disabled && canGoForward, scopes: hotkeyScope},
    });

    if (disabled) {
        return null;
    }

    return actions;
}
