import React from 'react';

import {SelectMigrationToWorkbookDialog} from '../../SelectMigrationToWorkbookDialog';
import {EntryDialogResolveStatus} from '../constants';
import type {EntryDialogProps} from '../types';

export interface DialogMigrateToWorkbookProps extends EntryDialogProps {
    entryId: string;
}

export const DialogMigrateToWorkbook: React.FC<DialogMigrateToWorkbookProps> = ({
    entryId,
    visible,
    onClose,
}) => {
    return (
        <SelectMigrationToWorkbookDialog
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
