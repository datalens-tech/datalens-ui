import React from 'react';

import {registry} from 'ui/registry';
import type {DialogShareProps} from 'ui/registry/units/common/types/components/DialogShare';

import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

type DialogShareEntryProps = DialogShareProps & EntryDialogProps;

export const DialogShareEntry: React.FC<DialogShareEntryProps> = (props) => {
    const {DialogShare} = registry.common.components.getAll();

    const {sdk: _sdk, onClose, ...dialogShareProps} = props; // DialogShareProps does not contain SDK
    const handleOnClose = React.useCallback(
        () => onClose({status: EntryDialogResolveStatus.Close}),
        [],
    );

    return <DialogShare {...dialogShareProps} onClose={handleOnClose} />;
};
