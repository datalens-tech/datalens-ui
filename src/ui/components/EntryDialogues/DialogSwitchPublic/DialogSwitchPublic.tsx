import React from 'react';

import type {GetEntryResponse} from 'shared/schema';

import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

import DialogPublic from './DialogPublic/DialogPublic';

export interface DialogSwitchPublicProps extends EntryDialogProps {
    entry: GetEntryResponse;
}

const DialogSwitchPublic = (props: DialogSwitchPublicProps) => {
    const onClose = (status: 'success' | 'close' | unknown, publish: boolean) => {
        if (status === 'success') {
            props.onClose({status: EntryDialogResolveStatus.Success, data: {publish}});
        } else {
            props.onClose({status: EntryDialogResolveStatus.Close, data: {}});
        }
    };
    return <DialogPublic {...props} onClose={onClose} />;
};

export default DialogSwitchPublic;
