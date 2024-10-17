import React from 'react';

import {ArrowUturnCcwLeft, ArrowUturnCwRight, LayoutHeader} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Feature, QLPageQA} from 'shared';
import type {AdditionalButtonTemplate} from 'ui/components/ActionPanel/components/ChartSaveControls/types';
import {REDO_HOTKEY, UNDO_HOTKEY} from 'ui/constants/misc';
import {useBindHotkey} from 'ui/hooks/useBindHotkey';
import {type DatalensGlobalState, Utils} from 'ui/index';
import {goBack, goForward} from 'ui/store/actions/editHistory';
import {selectCanGoBack, selectCanGoForward} from 'ui/store/selectors/editHistory';
import {QL_EDIT_HISTORY_UNIT_ID} from 'ui/units/ql/constants';

const b = block('wizard-action-panel');

export type UseQlActionPanelArgs = {
    onClickButtonToggleTablePreview: () => void;
};

export const useQLActionPanel = (args: UseQlActionPanelArgs): AdditionalButtonTemplate[] => {
    const dispatch = useDispatch();

    const {onClickButtonToggleTablePreview} = args;

    const enableEditHistoryQL = Utils.isEnabledFeature(Feature.EnableEditHistoryQL);

    const canGoBack = useSelector<DatalensGlobalState, ReturnType<typeof selectCanGoBack>>(
        (state) => selectCanGoBack(state, {unitId: QL_EDIT_HISTORY_UNIT_ID}),
    );

    const canGoForward = useSelector<DatalensGlobalState, ReturnType<typeof selectCanGoForward>>(
        (state) => selectCanGoForward(state, {unitId: QL_EDIT_HISTORY_UNIT_ID}),
    );

    const onClickGoBack = React.useCallback(() => {
        if (canGoBack && enableEditHistoryQL) {
            dispatch(goBack({unitId: QL_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoBack, dispatch, enableEditHistoryQL]);

    const onClickGoForward = React.useCallback(() => {
        if (canGoForward && enableEditHistoryQL) {
            dispatch(goForward({unitId: QL_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoForward, dispatch, enableEditHistoryQL]);

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

    return React.useMemo<AdditionalButtonTemplate[]>(() => {
        let items: AdditionalButtonTemplate[] = [
            {
                key: 'toggle-table-preview-button',
                title: i18n('wizard', 'tooltip_table-preview'),
                action: () => onClickButtonToggleTablePreview(),
                className: b('toggle-preview-btn'),
                icon: {
                    data: LayoutHeader,
                    size: 16,
                    className: b('toggle-preview-icon'),
                },
            },
        ];

        if (enableEditHistoryQL) {
            items = [
                {
                    key: 'undo',
                    action: onClickGoBack,
                    className: b('undo-btn'),
                    icon: {data: ArrowUturnCcwLeft, size: 16},
                    view: 'flat',
                    disabled: !canGoBack,
                    qa: QLPageQA.UndoButton,
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
                    qa: QLPageQA.RedoButton,
                    title: i18n('component.action-panel.view', 'button_redo'),
                    hotkey: REDO_HOTKEY.join('+'),
                },
                ...items,
            ];
        }

        return items;
    }, [
        enableEditHistoryQL,
        onClickButtonToggleTablePreview,
        onClickGoBack,
        canGoBack,
        onClickGoForward,
        canGoForward,
    ]);
};
