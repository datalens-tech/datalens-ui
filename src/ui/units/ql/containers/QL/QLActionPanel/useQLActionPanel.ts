import React from 'react';

import {ArrowUturnCcwLeft, ArrowUturnCwRight, CircleInfo, LayoutHeader} from '@gravity-ui/icons';
import block from 'bem-cn-lite';
import {i18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {QLPageQA} from 'shared';
import {
    DIALOG_ENTRY_DESCRIPTION,
    openDialogEntryAnnotationDescription,
} from 'ui/components/DialogEntryDescription';
import {updateDialogProps} from 'ui/store/actions/dialog';

import {type DatalensGlobalState} from '../../../../../';
import type {AdditionalButtonTemplate} from '../../../../../components/ActionPanel/components/ChartSaveControls/types';
import {HOTKEYS_SCOPES, REDO_HOTKEY, UNDO_HOTKEY} from '../../../../../constants/misc';
import {useBindHotkey} from '../../../../../hooks/useBindHotkey';
import {goBack, goForward} from '../../../../../store/actions/editHistory';
import {selectCanGoBack, selectCanGoForward} from '../../../../../store/selectors/editHistory';
import {QL_EDIT_HISTORY_UNIT_ID} from '../../../constants';
import {setDescription} from '../../../store/actions/ql';
import {getDescription, getIsDescriptionChanged} from '../../../store/reducers/ql';

const b = block('wizard-action-panel');

export type UseQlActionPanelArgs = {
    canEdit?: boolean;
    handleClickButtonToggleTablePreview: () => void;
};

export const useQLActionPanel = (args: UseQlActionPanelArgs): AdditionalButtonTemplate[] => {
    const dispatch = useDispatch();

    const {canEdit, handleClickButtonToggleTablePreview} = args;

    const canGoBack = useSelector<DatalensGlobalState, ReturnType<typeof selectCanGoBack>>(
        (state) => selectCanGoBack(state, {unitId: QL_EDIT_HISTORY_UNIT_ID}),
    );

    const canGoForward = useSelector<DatalensGlobalState, ReturnType<typeof selectCanGoForward>>(
        (state) => selectCanGoForward(state, {unitId: QL_EDIT_HISTORY_UNIT_ID}),
    );

    const description = useSelector(getDescription);
    const isDescriptionChanged = useSelector(getIsDescriptionChanged);

    const handleClickGoBack = React.useCallback(() => {
        if (canGoBack) {
            dispatch(goBack({unitId: QL_EDIT_HISTORY_UNIT_ID}));
        }
    }, [canGoBack, dispatch]);

    const handleClickGoForward = React.useCallback(() => {
        if (canGoForward) {
            dispatch(goForward({unitId: QL_EDIT_HISTORY_UNIT_ID}));
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
            updateDialogProps({
                id: DIALOG_ENTRY_DESCRIPTION,
                props: {
                    title: i18n('sql', 'label_ql-info'),
                    description: description || '',
                    canEdit: true,
                    isEditMode: true,
                    onApply: handleApplyDescriptionClick,
                },
            }),
        );
    }, [description, dispatch, handleApplyDescriptionClick]);

    const handleOpenDescription = React.useCallback(() => {
        dispatch(
            openDialogEntryAnnotationDescription({
                title: i18n('sql', 'label_ql-info'),
                description: description || '',
                canEdit,
                onEdit: handleEditDescriptionClick,
                isEditMode: canEdit && (!description || isDescriptionChanged),
                onApply: handleApplyDescriptionClick,
            }),
        );
    }, [
        dispatch,
        description,
        canEdit,
        handleEditDescriptionClick,
        isDescriptionChanged,
        handleApplyDescriptionClick,
    ]);

    useBindHotkey({
        key: UNDO_HOTKEY,
        handler: handleClickGoBack,
        options: {scopes: HOTKEYS_SCOPES.QL},
    });

    useBindHotkey({
        key: REDO_HOTKEY,
        handler: handleClickGoForward,
        options: {scopes: HOTKEYS_SCOPES.QL},
    });

    return React.useMemo<AdditionalButtonTemplate[]>(() => {
        let items: AdditionalButtonTemplate[] = [
            {
                key: 'toggle-table-preview-button',
                // TODO move key from wizard
                title: i18n('wizard', 'tooltip_table-preview'),
                action: () => handleClickButtonToggleTablePreview(),
                className: b('toggle-preview-btn'),
                icon: {
                    data: LayoutHeader,
                    size: 16,
                    className: b('toggle-preview-icon'),
                },
            },
        ];

        if (canEdit || description) {
            items.push({
                key: 'description',
                action: handleOpenDescription,
                icon: {data: CircleInfo, size: 16},
                view: 'flat',
            });
        }

        items = [
            {
                key: 'undo',
                action: handleClickGoBack,
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
                action: handleClickGoForward,
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

        return items;
    }, [
        canEdit,
        description,
        handleClickGoBack,
        canGoBack,
        handleClickGoForward,
        canGoForward,
        handleClickButtonToggleTablePreview,
        handleOpenDescription,
    ]);
};
