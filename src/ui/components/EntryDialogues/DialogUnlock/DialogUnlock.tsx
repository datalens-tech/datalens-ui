import React from 'react';

import {registry} from 'ui/registry';

import type {EntryFields} from '../../../../shared/schema';
import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

export interface DialogUnlockProps extends EntryDialogProps {
    entry: Pick<EntryFields, 'entryId' | 'key' | 'scope' | 'type'>;
}

const DialogUnlock: React.FC<DialogUnlockProps> = (props) => {
    const onClose = () => {
        props.onClose({status: EntryDialogResolveStatus.Close});
    };

    const {DialogAddParticipants} = registry.common.components.getAll();

    return (
        <DialogAddParticipants
            {...props}
            onClose={onClose}
            onSuccess={onClose}
            showParticipantsRequests
            showOwners={true}
            mode="request"
        />
    );
};

export default DialogUnlock;
