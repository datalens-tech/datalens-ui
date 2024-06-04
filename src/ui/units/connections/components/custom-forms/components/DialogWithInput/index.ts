import DialogManager from '../../../../../../components/DialogManager/DialogManager';

import {DialogWithInput} from './DialogWithInput';
import type {DialogConnWithInputProps} from './types';

export const DIALOG_CONN_WITH_INPUT = Symbol('DIALOG_CONN_WITH_INPUT');

export type OpenDialogConnWithInputArgs<T = unknown> = {
    id: typeof DIALOG_CONN_WITH_INPUT;
    props: DialogConnWithInputProps<T>;
};

DialogManager.registerDialog(DIALOG_CONN_WITH_INPUT, DialogWithInput);
