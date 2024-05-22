import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {ControlQA} from 'shared/constants/qa';
import {applyGroupControlDialog} from 'units/dash/store/actions/controls/actions';

import TwoColumnDialog from '../../../components/TwoColumnDialog/TwoColumnDialog';
import {closeDialog} from '../../../store/actions/dialogs/actions';

import {GroupControlBody} from './GroupControlBody/GroupControlBody';
import {GroupControlFooter} from './GroupControlFooter/GroupControlFooter';
import {GroupControlSidebar} from './GroupControlSidebar/GroupControlSidebar';

import './GroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export const GroupControl = () => {
    const dispatch = useDispatch();

    const handleClose = () => {
        dispatch(closeDialog());
    };

    const handleApply = () => {
        dispatch(applyGroupControlDialog());
    };

    return (
        <TwoColumnDialog
            className={b()}
            open={true}
            onClose={handleClose}
            sidebarHeader={i18n('label_selectors-list')}
            sidebar={<GroupControlSidebar />}
            bodyHeader={i18n('label_selector-settings')}
            body={<GroupControlBody />}
            footer={<GroupControlFooter handleClose={handleClose} handleApply={handleApply} />}
            contentClassMixin={b('content')}
            bodyClassMixin={b('body')}
            sidebarClassMixin={b('sidebar-content')}
            qa={ControlQA.dialogControl}
        />
    );
};
