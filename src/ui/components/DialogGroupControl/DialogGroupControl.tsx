import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import type {DashTabItemWidget} from 'shared';
import {ControlQA} from 'shared/constants/qa';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import type {SetItemDataArgs} from 'ui/units/dash/store/actions/dashTyped';
import {applyGroupControlDialog} from 'units/dash/store/actions/controls/actions';

import TwoColumnDialog from '../ControlComponents/TwoColumnDialog/TwoColumnDialog';

import {GroupControlBody} from './GroupControlBody/GroupControlBody';
import {GroupControlFooter} from './GroupControlFooter/GroupControlFooter';
import {GroupControlSidebar} from './GroupControlSidebar/GroupControlSidebar';

import './DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export type DialogGroupControlProps = {
    openedItemId: string | null;
    openedItemData: DashTabItemWidget['data'];
    dialogIsVisible: boolean;
    currentTabId: string | null;
    workbookId: string | null;
    navigationPath: string | null;
    closeDialog: () => void;
    setItemData: (newItemData: SetItemDataArgs) => void;
    changeNavigationPath: (newNavigationPath: string) => void;
};

export const DialogGroupControl: React.FC<DialogGroupControlProps> = ({closeDialog}) => {
    const {id, draftId} = useSelector(selectSelectorDialog);
    const dispatch = useDispatch();

    const handleApply = () => {
        dispatch(applyGroupControlDialog());
    };

    const handleClose = React.useCallback(() => {
        closeDialog();
    }, [closeDialog]);

    return (
        <TwoColumnDialog
            className={b()}
            open={true}
            onClose={handleClose}
            sidebarHeader={i18n('label_selectors-list')}
            sidebar={<GroupControlSidebar />}
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
