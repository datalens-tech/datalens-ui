import DialogManager from '../../../../../components/DialogManager/DialogManager';

import {Confirm} from './Confirm';
import type {DialogConfirmProps} from './types';

export const DIALOG_CONN_CONFIRM = Symbol('DIALOG_CONN_CONFIRM');

export type OpenDialogConnConfirmArgs = {
    id: typeof DIALOG_CONN_CONFIRM;
    props: DialogConfirmProps;
};

DialogManager.registerDialog(DIALOG_CONN_CONFIRM, Confirm);
