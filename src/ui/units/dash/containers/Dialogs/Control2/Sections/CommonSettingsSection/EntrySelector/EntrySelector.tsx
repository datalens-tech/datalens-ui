import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Button} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import type {GetEntryResponse} from 'shared/schema/us/types/entries';

import {FieldWrapper} from '../../../../../../../../components/FieldWrapper/FieldWrapper';
import DropdownNavigation from '../../../../../DropdownNavigation/DropdownNavigation';

import './EntrySelector.scss';

const i18n = I18n.keyset('dash.control-dialog.edit');
const b = block('entry-selector');

type EntrySelectorProps = {
    label: string;
    entryId: string | undefined;
    scope: string;
    handleEntryChange: (data: {entry: GetEntryResponse}) => void;
    isValidEntry: boolean;
    getEntryLink: (entryId: string) => string;
    error?: boolean;
    errorText?: string;
};

export const EntrySelector: React.FC<EntrySelectorProps> = (props: EntrySelectorProps) => {
    const {label, getEntryLink, isValidEntry, errorText, error, entryId, handleEntryChange, scope} =
        props;

    return (
        <FormRow label={label}>
            <FieldWrapper error={errorText}>
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
                        //@ts-ignore
                        error={error}
                    />
                    {isValidEntry && entryId && (
                        <Button
                            className={b('button')}
                            target="_blank"
                            href={getEntryLink(entryId)}
                        >
                            {i18n('button_open')}
                        </Button>
                    )}
                </div>
            </FieldWrapper>
        </FormRow>
    );
};
