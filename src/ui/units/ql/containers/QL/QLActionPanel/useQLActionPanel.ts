import React from 'react';

import {ArrowUturnCcwLeft, ArrowUturnCwRight, LayoutHeader} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {QLPageQA} from 'shared';
import type {AdditionalButtonTemplate} from 'ui/components/ActionPanel/components/ChartSaveControls/types';
import {REDO_HOTKEY, UNDO_HOTKEY} from 'ui/constants/misc';
import {useBindHotkey} from 'ui/hooks/useBindHotkey';
import {goBack, goForward} from 'ui/store/actions/editHistory';
import {QL_EDIT_HISTORY_UNIT_ID} from 'ui/units/ql/constants';

const b = block('wizard-action-panel');

export type UseQlActionPanelArgs = {
    onClickButtonToggleTablePreview: () => void;
    canGoBack: boolean | null;
    canGoForward: boolean | null;
};

export const useQLActionPanel = (args: UseQlActionPanelArgs): AdditionalButtonTemplate[] => {
    const dispatch = useDispatch();

    const {onClickButtonToggleTablePreview, canGoBack, canGoForward} = args;

    const onClickGoBack = React.useCallback(() => {
        if (canGoBack) {
            dispatch(goBack({unitId: QL_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoBack, dispatch]);

    const onClickGoForward = React.useCallback(() => {
        if (canGoForward) {
            dispatch(goForward({unitId: QL_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoForward, dispatch]);

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
        const items: AdditionalButtonTemplate[] = [
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
        ];

        return [
            ...items,
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
    }, [onClickGoBack, canGoBack, onClickGoForward, canGoForward, onClickButtonToggleTablePreview]);
};
