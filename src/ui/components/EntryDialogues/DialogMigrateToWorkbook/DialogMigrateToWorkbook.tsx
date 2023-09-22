import React from 'react';

import {MigrateToWorkbookDialog} from '../../MigrateToWorkbookDialog';
import {EntryDialogResolveStatus} from '../constants';
import {EntryDialogProps} from '../types';

export interface DialogMigrateToWorkbookProps extends EntryDialogProps {
    entryId: string;
}

export const DialogMigrateToWorkbook: React.FC<DialogMigrateToWorkbookProps> = ({
    entryId,
    visible,
    onClose,
}) => {
    return (
        <MigrateToWorkbookDialog
            open={visible}
            entryId={entryId}
            onSuccess={() => {
                onClose({status: EntryDialogResolveStatus.Success});
            }}
            onClose={() => {
                onClose({status: EntryDialogResolveStatus.Close});
            }}
        />
    );
};
