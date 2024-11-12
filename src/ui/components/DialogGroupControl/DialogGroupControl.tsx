import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import type {DashTabItemGroupControlData} from 'shared';
import {ControlQA} from 'shared/constants/qa';
import {openDialog} from 'ui/store/actions/dialog';
import {setSelectorDialogItem} from 'ui/units/dash/store/actions/dashTyped';
// import {
//     selectActiveSelectorIndex,
//     selectSelectorsGroup,
// } from 'ui/units/dash/store/selectors/controls/selectors';
// import {selectSelectorControlType} from 'ui/units/dash/store/selectors/dashTypedSelectors';
// import {
//     addSelectorToGroup,
//     applyGroupControlDialog,
//     copyControlToStorage,
//     setActiveSelectorIndex,
//     updateSelectorsGroup,
// } from 'units/dash/store/actions/controls/actions';

import TwoColumnDialog from '../../units/dash/components/TwoColumnDialog/TwoColumnDialog';
import {DIALOG_SELECTORS_PLACEMENT} from '../DialogSelectorsPlacement/DialogSelectorsPlacement';

import {GroupControlBody} from './GroupControlBody/GroupControlBody';
import {GroupControlFooter} from './GroupControlFooter/GroupControlFooter';
import {GroupControlSidebar} from './GroupControlSidebar/GroupControlSidebar';
import {useGroupControlState} from './useGroupControlState';

import './DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

// const grouupControlReducer = () => {};

type DialogGroupControlProps = {
    dialogIsVisible: boolean;
    openedItemData: DashTabItemGroupControlData;
    closeDialog: () => void;
    lastUsedDatasetId?: string;
};

export const DialogGroupControl = ({
    dialogIsVisible,
    openedItemData,
    closeDialog,
    // lastUsedDatasetId,
}: DialogGroupControlProps) => {
    const globalDispatch = useDispatch();

    // const selectorsGroup = useSelector(selectSelectorsGroup);
    // const activeSelectorIndex = useSelector(selectActiveSelectorIndex);
    // const elementType = useSelector(selectSelectorControlType);
    // const controlsData = selectorsGroup.group[activeSelectorIndex];

    const {
        state,
        setActiveSelectorIndex,
        updateSelectorsGroup,
        addSelectorToGroup,
        updateCurrentSelectorGroup,
    } = useGroupControlState(openedItemData);
    const {selectorsGroup, activeSelectorIndex} = state;
    const controlsData = selectorsGroup.group[activeSelectorIndex];
    const elementType = controlsData.elementType;

    const openSelectorsPlacementDialog = React.useCallback(() => {
        globalDispatch(
            openDialog({
                id: DIALOG_SELECTORS_PLACEMENT,
                props: {
                    onApply: (selectorsGroupUpdate) => {
                        updateSelectorsGroup(selectorsGroupUpdate);
                    },
                    selectorsGroup,
                },
            }),
        );
    }, [globalDispatch, selectorsGroup, updateSelectorsGroup]);

    const handleSetActiveSelectorIndex = React.useCallback(
        (index: number) => {
            setActiveSelectorIndex(index);
        },
        [setActiveSelectorIndex],
    );

    const handleAddSelectorToGroup = addSelectorToGroup;
    const handleUpdateSelectorsGroup = updateSelectorsGroup;

    const handleSetSelectorDialogItem = React.useCallback(
        (title: string) => {
            globalDispatch(setSelectorDialogItem({title}));
            updateCurrentSelectorGroup({title});
        },
        [globalDispatch, updateCurrentSelectorGroup],
    );

    const handleCopyControlToStorage = React.useCallback((index: number) => {
        // eslint-disable-next-line no-console
        console.log(index);
        // TODO
        // dispatch(copyControlToStorage(index));
    }, []);

    const handleApply = React.useCallback(() => {
        // dispatch(applyGroupControlDialog());
        closeDialog();
    }, [closeDialog]);

    return (
        <TwoColumnDialog
            className={b()}
            open={dialogIsVisible}
            onClose={closeDialog}
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
            body={<GroupControlBody elementType={elementType} controlData={controlsData} />}
            footer={<GroupControlFooter handleClose={closeDialog} handleApply={handleApply} />}
            contentClassMixin={b('content')}
            bodyClassMixin={b('body')}
            sidebarClassMixin={b('sidebar-content')}
            qa={ControlQA.dialogControl}
        />
    );
};
