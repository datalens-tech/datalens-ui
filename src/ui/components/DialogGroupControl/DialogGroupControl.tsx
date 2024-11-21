import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DashTabItemGroupControl} from 'shared';
import {ControlQA} from 'shared/constants/qa';
import {applyGroupControlDialog, copyControlToStorage} from 'ui/store/actions/controlDialog';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import type {SetItemDataArgs} from 'ui/units/dash/store/actions/dashTyped';

import TwoColumnDialog from '../ControlComponents/TwoColumnDialog/TwoColumnDialog';

import {GroupControlBody} from './GroupControlBody/GroupControlBody';
import {GroupControlFooter} from './GroupControlFooter/GroupControlFooter';
import {GroupControlSidebar} from './GroupControlSidebar/GroupControlSidebar';

import './DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export type DialogGroupControlFeaturesProps = {
    enableAutoheightDefault?: boolean;
};

export type DialogGroupControlProps = {
    openedItemData: DashTabItemGroupControl['data'];
    dialogIsVisible: boolean;
    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
} & DialogGroupControlFeaturesProps;

export const DialogGroupControl: React.FC<DialogGroupControlProps> = ({
    dialogIsVisible,
    closeDialog,
    setItemData,
    navigationPath,
    changeNavigationPath,
    enableAutoheightDefault,
}) => {
    const {id, draftId} = useSelector(selectSelectorDialog);

    const dispatch = useDispatch();
    const handleApply = React.useCallback(() => {
        dispatch(
            applyGroupControlDialog({
                setItemData,
                closeDialog,
            }),
        );
    }, [closeDialog, dispatch, setItemData]);

    const handleClose = React.useCallback(() => {
        closeDialog();
    }, [closeDialog]);

    const handleCopyItem = React.useCallback(
        (itemIndex: number) => {
            dispatch(copyControlToStorage(itemIndex));
        },
        [dispatch],
    );

    return (
        <TwoColumnDialog
            className={b()}
            open={dialogIsVisible}
            onClose={handleClose}
            sidebarHeader={i18n('label_selectors-list')}
            sidebar={
                <GroupControlSidebar
                    enableAutoheightDefault={enableAutoheightDefault}
                    handleCopyItem={handleCopyItem}
                />
            }
            bodyHeader={i18n('label_selector-settings')}
            // key for rerendering form on tab change
            body={
                <GroupControlBody
                    key={draftId || id}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                />
            }
            footer={<GroupControlFooter handleClose={handleClose} handleApply={handleApply} />}
            contentClassMixin={b('content')}
            bodyClassMixin={b('body')}
            sidebarClassMixin={b('sidebar-content')}
            qa={ControlQA.dialogControl}
        />
    );
};
