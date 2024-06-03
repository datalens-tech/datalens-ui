import type SDK from '../../libs/sdk';

import type {EntryDialogResolveStatus} from './constants';

export interface EntryDialogOnCloseArg {
    status: EntryDialogResolveStatus;
    data?: Record<string, any>;
}

export type EntryDialogOnClose = (arg: EntryDialogOnCloseArg) => void;

export interface EntryDialogProps {
    sdk: SDK;
    onClose: EntryDialogOnClose;
    visible: boolean;
}
