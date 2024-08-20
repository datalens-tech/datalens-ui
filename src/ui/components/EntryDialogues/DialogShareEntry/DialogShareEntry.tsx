import React from 'react';

import type {DialogShareProps} from 'ui/components/DialogShare/DialogShare';
import {DialogShare} from 'ui/components/DialogShare/DialogShare';

import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

type DialogShareEntryProps = DialogShareProps & EntryDialogProps;

export const DialogShareEntry: React.FC<DialogShareEntryProps> = (props) => {
    const {sdk: _sdk, onClose, ...dialogShareProps} = props; // DialogShareProps does not contain SDK
    const handleOnClose = React.useCallback(
        () => onClose({status: EntryDialogResolveStatus.Close}),
        [],
    );

    return <DialogShare {...dialogShareProps} onClose={handleOnClose} />;
};
