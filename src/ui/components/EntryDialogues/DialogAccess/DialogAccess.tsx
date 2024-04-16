import React from 'react';

import {registry} from 'ui/registry';

import type {GetEntryResponse} from '../../../../shared/schema';
import {EntryDialogProps} from '../types';

export interface DialogAccessProps extends EntryDialogProps {
    entry: GetEntryResponse;
    showCustomDescription?: boolean;
}

export const DialogAccess: React.FC<DialogAccessProps> = (props) => {
    const {AccessRights} = registry.common.components.getAll();

    return <AccessRights {...props} />;
};
