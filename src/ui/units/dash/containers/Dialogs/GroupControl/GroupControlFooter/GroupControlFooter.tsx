import React from 'react';

import {Dialog} from '@gravity-ui/uikit';
import {I18n} from 'i18n';

const i18n = I18n.keyset('dash.group-controls-dialog.edit');

type GroupControlFooterProps = {
    handleClose: () => void;
};

export const GroupControlFooter = ({handleClose}: GroupControlFooterProps) => {
    return (
        <Dialog.Footer
            onClickButtonCancel={handleClose}
            onClickButtonApply={() => {}}
            textButtonApply={i18n('button_save')}
            textButtonCancel={i18n('button_cancel')}
            propsButtonApply={{disabled: true}}
        />
    );
};
