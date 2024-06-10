import React from 'react';

import DialogManager from '../DialogManager/DialogManager';
import { DialogShare } from '../DialogShare/DialogShare';
import {URL_OPTIONS as COMMON_URL_OPTIONS} from 'ui/constants';

export interface DialogShareProps {
    entryId: string | undefined;
    onClose: () => void;
}


export const DIALOG_SHARE_WIDGET = Symbol('DIALOG_SHARE_WIDGET');

export type OpenDialogShareArgs = {
    id: typeof DIALOG_SHARE_WIDGET;
    props?: DialogShareProps;
};
function DialogShareWidget(props: DialogShareProps) {

    const {
        onClose,
        entryId,
    } = props;


    return (
        <DialogShare
            onClose={onClose}
            propsData={{id: entryId}}
            initialParams={{
                [COMMON_URL_OPTIONS.EMBEDDED]: 1,
                [COMMON_URL_OPTIONS.NO_CONTROLS]: 1,
            }}
        />
    );
}

DialogManager.registerDialog(DIALOG_SHARE_WIDGET, DialogShareWidget);
