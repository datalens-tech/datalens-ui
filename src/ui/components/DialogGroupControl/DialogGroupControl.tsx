import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA} from 'shared/constants/qa';
import {selectSelectorDialog} from 'ui/store/selectors/controlDialog';
import {applyGroupControlDialog} from 'units/dash/store/actions/controls/actions';

import TwoColumnDialog from '../../units/dash/components/TwoColumnDialog/TwoColumnDialog';
import {closeDialog} from '../../units/dash/store/actions/dialogs/actions';

import {GroupControlBody} from './GroupControlBody/GroupControlBody';
import {GroupControlFooter} from './GroupControlFooter/GroupControlFooter';
import {GroupControlSidebar} from './GroupControlSidebar/GroupControlSidebar';

import './DialogGroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export const DialogGroupControl = () => {
    const {id, draftId} = useSelector(selectSelectorDialog);
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
