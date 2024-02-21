import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {GetEntryResponse} from 'shared/schema/us/types/entries';

import DropdownNavigation from '../../../../../DropdownNavigation/DropdownNavigation';

const i18n = I18n.keyset('dash.control-dialog.edit');
const b = block('entry-selector');

type EntrySelectorProps = {
    label: string;
    entryId: string | undefined;
    scope: string;
    handleEntryChange: (entry: GetEntryResponse) => void;
    isValidEntry: boolean;
    getEntryLink: (entryId: string) => string;
};

export const EntrySelector: React.FC<EntrySelectorProps> = (props: EntrySelectorProps) => {
    const {label, getEntryLink, isValidEntry, entryId, handleEntryChange, scope} = props;

    return (
        <FormRow label={label}>
            <div className={b('droplist')}>
                <DropdownNavigation
                    //@ts-ignore
                    size="m"
                    //@ts-ignore
                    entryId={entryId}
                    //@ts-ignore
                    scope={scope}
                    //@ts-ignore
                    onClick={handleEntryChange}
                />
                {isValidEntry && entryId && (
                    <Button className={b('button')} target="_blank" href={getEntryLink(entryId)}>
                        {i18n('button_open')}
                    </Button>
                )}
            </div>
        </FormRow>
    );
};
