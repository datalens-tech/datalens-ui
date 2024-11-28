import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {ControlQA} from 'shared';

const i18n = I18n.keyset('dash.group-controls-dialog.edit');

type GroupControlFooterProps = {
    handleClose: () => void;
    handleApply: () => void;
};

export const GroupControlFooter = ({handleClose, handleApply}: GroupControlFooterProps) => {
    return (
        <Dialog.Footer
            onClickButtonCancel={handleClose}
            onClickButtonApply={handleApply}
            textButtonApply={i18n('button_save')}
            textButtonCancel={i18n('button_cancel')}
            propsButtonApply={{qa: ControlQA.dialogControlApplyBtn}}
            propsButtonCancel={{qa: ControlQA.dialogControlCancelBtn}}
        />
    );
};
