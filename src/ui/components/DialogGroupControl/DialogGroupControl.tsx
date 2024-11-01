import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA} from 'shared/constants/qa';
import {openDialog} from 'ui/store/actions/dialog';
import type {SelectorsGroupDialogState} from 'ui/units/dash/store/actions/controls/types';
import type {SetSelectorDialogItemArgs} from 'ui/units/dash/store/actions/dashTyped';
import {setSelectorDialogItem} from 'ui/units/dash/store/actions/dashTyped';
import {
    selectActiveSelectorIndex,
    selectSelectorsGroup,
} from 'ui/units/dash/store/selectors/controls/selectors';
import {
    selectSelectorControlType,
    selectSelectorDialog,
} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {
    addSelectorToGroup,
    applyGroupControlDialog,
    copyControlToStorage,
    setActiveSelectorIndex,
    updateSelectorsGroup,
} from 'units/dash/store/actions/controls/actions';

import TwoColumnDialog from '../../units/dash/components/TwoColumnDialog/TwoColumnDialog';
import {closeDialog} from '../../units/dash/store/actions/dialogs/actions';
import {DIALOG_SELECTORS_PLACEMENT} from '../DialogSelectorsPlacement/DialogSelectorsPlacement';

import {GroupControlBody} from './GroupControlBody/GroupControlBody';
import {GroupControlFooter} from './GroupControlFooter/GroupControlFooter';
import {GroupControlSidebar} from './GroupControlSidebar/GroupControlSidebar';

import './DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export const DialogGroupControl = () => {
    const dispatch = useDispatch();

    const {id, draftId} = useSelector(selectSelectorDialog);
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const activeSelectorIndex = useSelector(selectActiveSelectorIndex);
    const elementType = useSelector(selectSelectorControlType);

    const handleClose = React.useCallback(() => {
        dispatch(closeDialog());
    }, [dispatch]);

    const handleAddSelectorToGroup = React.useCallback(
        (selectorArgs: SetSelectorDialogItemArgs) => {
            dispatch(addSelectorToGroup(selectorArgs));
        },
        [dispatch],
    );

    const handleCopyControlToStorage = React.useCallback(
        (index: number) => {
            dispatch(copyControlToStorage(index));
        },
        [dispatch],
    );

    const handleSetSelectorDialogItem = React.useCallback(
        (title: string) => {
            dispatch(setSelectorDialogItem({title}));
        },
        [dispatch],
    );

    const handleSetActiveSelectorIndex = React.useCallback(
        (index: number) => {
            dispatch(
                setActiveSelectorIndex({
                    activeSelectorIndex: index,
                }),
            );
        },
        [dispatch],
    );

    const handleUpdateSelectorsGroup = React.useCallback(
        (selectorState: SelectorsGroupDialogState) => {
            dispatch(updateSelectorsGroup(selectorState));
        },
        [dispatch],
    );

    const openSelectorsPlacementDialog = React.useCallback(() => {
        dispatch(
            openDialog({
                id: DIALOG_SELECTORS_PLACEMENT,
                props: {
                    onApply: (selectorsGroupUpdate) => {
                        dispatch(updateSelectorsGroup(selectorsGroupUpdate));
                    },
                    selectorsGroup,
                },
            }),
        );
    }, [dispatch, selectorsGroup]);

    const handleApply = React.useCallback(() => {
        dispatch(applyGroupControlDialog());
    }, [dispatch]);

    return (
        <TwoColumnDialog
            className={b()}
            open={true}
            onClose={handleClose}
            sidebarHeader={i18n('label_selectors-list')}
            sidebar={
                <GroupControlSidebar
                    openSelectorsPlacementDialog={openSelectorsPlacementDialog}
                    addSelectorToGroup={handleAddSelectorToGroup}
                    copyControlToStorage={handleCopyControlToStorage}
                    setSelectorDialogItem={handleSetSelectorDialogItem}
                    setActiveSelectorIndex={handleSetActiveSelectorIndex}
                    updateSelectorsGroup={handleUpdateSelectorsGroup}
                    selectorsGroup={selectorsGroup}
                    activeSelectorIndex={activeSelectorIndex}
                />
            }
            bodyHeader={i18n('label_selector-settings')}
            // key for rerendering form on tab change
            body={<GroupControlBody elementType={elementType} key={draftId || id} />}
            footer={<GroupControlFooter handleClose={handleClose} handleApply={handleApply} />}
            contentClassMixin={b('content')}
            bodyClassMixin={b('body')}
            sidebarClassMixin={b('sidebar-content')}
            qa={ControlQA.dialogControl}
        />
    );
};
