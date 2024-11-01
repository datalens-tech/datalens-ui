import React from 'react';

import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {ControlQA} from 'shared/constants/qa';
import {openDialog} from 'ui/store/actions/dialog';
import {
    selectActiveSelectorIndex,
    selectSelectorsGroup,
} from 'ui/units/dash/store/selectors/controls/selectors';
import {
    selectSelectorControlType,
    selectSelectorDialog,
} from 'ui/units/dash/store/selectors/dashTypedSelectors';
import {
    applyGroupControlDialog,
    updateSelectorsGroup,
} from 'units/dash/store/actions/controls/actions';

import {DIALOG_SELECTORS_PLACEMENT} from '../../../../../components/DialogSelectorsPlacement/DialogSelectorsPlacement';
import TwoColumnDialog from '../../../components/TwoColumnDialog/TwoColumnDialog';
import {closeDialog} from '../../../store/actions/dialogs/actions';

import {GroupControlBody} from './GroupControlBody/GroupControlBody';
import {GroupControlFooter} from './GroupControlFooter/GroupControlFooter';
import {GroupControlSidebar} from './GroupControlSidebar/GroupControlSidebar';

import './GroupControl.scss';

const b = block('group-control-dialog');
const i18n = I18n.keyset('dash.group-controls-dialog.edit');

export const GroupControl = () => {
    const {id, draftId} = useSelector(selectSelectorDialog);
    const selectorsGroup = useSelector(selectSelectorsGroup);
    const activeSelectorIndex = useSelector(selectActiveSelectorIndex);
    const elementType = useSelector(selectSelectorControlType);

    const dispatch = useDispatch();

    const handleClose = React.useCallback(() => {
        dispatch(closeDialog());
    }, [dispatch]);

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
                    dispatch={dispatch}
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
