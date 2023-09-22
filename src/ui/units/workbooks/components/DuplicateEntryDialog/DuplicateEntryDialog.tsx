import React from 'react';

import {I18n} from 'i18n';
import {CopyWorkbookEntryResponse} from 'shared/schema';
import {DataLensApiError} from 'ui/typings';
import {isEntryAlreadyExists} from 'utils/errors/errorByCode';

import {getSdk} from '../../../../../ui/libs/schematic-sdk';
import DialogManager from '../../../../components/DialogManager/DialogManager';
import {DialogCreateWorkbookEntry} from '../../../../components/EntryDialogues/DialogCreateWorkbookEntry/DialogCreateWorkbookEntry';

export type Props = {
    open: boolean;
    onClose: () => void;
    onApply: (entry: CopyWorkbookEntryResponse, entryId: string) => void;
    initName: string;
    entryId: string;
};

export const DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK = Symbol('DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK');

export type OpenDialogDuplicateEntryInWorkbookArgs = {
    id: typeof DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK;
    props: Props;
};

const i18n = I18n.keyset('new-workbooks');

const DuplicateEntryDialog: React.FC<Props> = ({open, onClose, onApply, initName, entryId}) => {
    const handleApply = React.useCallback(
        async ({name}: {name: string}) => {
            const duplicatedEntry = await getSdk().us.copyWorkbookEntry({
                entryId,
                name,
            });

            onApply(duplicatedEntry, entryId);
        },
        [entryId, onApply],
    );

    const onError = (error: DataLensApiError) => {
        if (isEntryAlreadyExists(error)) {
            return {
                inputError: i18n('label_entry-name-already-exists'),
            };
        }

        return null;
    };

    const name = `${initName} - ${i18n('label_copy')}`;

    return (
        <DialogCreateWorkbookEntry
            visible={open}
            name={name}
            defaultName={name}
            caption={i18n('action_duplicate')}
            textButtonApply={i18n('button_apply')}
            textButtonCancel={i18n('button_cancel')}
            onClose={onClose}
            onApply={handleApply}
            onSuccess={onClose}
            onError={onError}
            placeholder={i18n('label_placeholder')}
        />
    );
};

DialogManager.registerDialog(DIALOG_DUPLICATE_ENTRY_IN_WORKBOOK, DuplicateEntryDialog);
