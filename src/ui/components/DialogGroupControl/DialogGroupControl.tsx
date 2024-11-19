import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DashTabItemWidget, EntryScope} from 'shared';
import {ControlQA} from 'shared/constants/qa';
import {applyGroupControlDialog, copyControlToStorage} from 'ui/store/actions/controlDialog';
import {
    selectActiveSelectorIndex,
    selectSelectorDialog,
    selectSelectorsGroup,
} from 'ui/store/selectors/controlDialog';
import type {SetItemDataArgs} from 'ui/units/dash/store/actions/dashTyped';

import TwoColumnDialog from '../ControlComponents/TwoColumnDialog/TwoColumnDialog';

import {GroupControlBody} from './GroupControlBody/GroupControlBody';
import {GroupControlFooter} from './GroupControlFooter/GroupControlFooter';
import {GroupControlSidebar} from './GroupControlSidebar/GroupControlSidebar';

import './DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export type DialogGroupControlProps = {
    scope: EntryScope;
    namespace: string;
    openedItemId: string | null;
    openedItemData: DashTabItemWidget['data'];
    dialogIsVisible: boolean;
    currentTabId: string | null;
    workbookId: string | null;
    entryId: string | null;
    navigationPath: string | null;
    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
    changeNavigationPath: (newNavigationPath: string) => void;
};

export const DialogGroupControl: React.FC<DialogGroupControlProps> = ({
    closeDialog,
    setItemData,
    openedItemId,
    openedItemData,
    entryId,
    workbookId,
    scope,
    currentTabId,
    namespace,
}) => {
    const {id, draftId} = useSelector(selectSelectorDialog);
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const activeSelectorIndex = useSelector(selectActiveSelectorIndex);

    const dispatch = useDispatch();
    const handleApply = React.useCallback(() => {
        dispatch(
            applyGroupControlDialog({
                selectorsGroup,
                openedItemId,
                activeSelectorIndex,
                openedItemData,
                setItemData,
                closeDialog,
            }),
        );
    }, [
        activeSelectorIndex,
        closeDialog,
        dispatch,
        openedItemData,
        openedItemId,
        selectorsGroup,
        setItemData,
    ]);

    const handleClose = React.useCallback(() => {
        closeDialog();
    }, [closeDialog]);

    const handleCopyItem = React.useCallback(
        (itemIndex: number) => {
            dispatch(
                copyControlToStorage(
                    {
                        entryId,
                        workbookId,
                        scope,
                        tabId: currentTabId,
                        namespace,
                    },
                    itemIndex,
                ),
            );
        },
        [currentTabId, dispatch, entryId, namespace, scope, workbookId],
    );

    return (
        <TwoColumnDialog
            className={b()}
            open={true}
            onClose={handleClose}
            sidebarHeader={i18n('label_selectors-list')}
            sidebar={<GroupControlSidebar handleCopyItem={handleCopyItem} />}
            bodyHeader={i18n('label_selector-settings')}
            // key for rerendering form on tab change
            body={<GroupControlBody key={draftId || id} />}
            footer={<GroupControlFooter handleClose={handleClose} handleApply={handleApply} />}
            contentClassMixin={b('content')}
            bodyClassMixin={b('body')}
            sidebarClassMixin={b('sidebar-content')}
            qa={ControlQA.dialogControl}
        />
    );
};
