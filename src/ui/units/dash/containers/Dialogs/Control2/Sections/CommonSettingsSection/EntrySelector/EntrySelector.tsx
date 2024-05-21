import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {StringParams} from 'shared/types';
import NavigationInput from 'ui/units/dash/components/NavigationInput/NavigationInput';
import {EntryTypeNode} from 'ui/units/dash/modules/constants';

import {FieldWrapper} from '../../../../../../../../components/FieldWrapper/FieldWrapper';

import './EntrySelector.scss';

const b = block('entry-selector');

type EntrySelectorProps = {
    label: string;
    entryId: string | undefined;
    scope?: string;
    handleEntryChange: ({
        entryId,
        name,
        params,
    }: {
        entryId: string;
        name: string;
        params?: StringParams;
    }) => void;
    isInvalid?: boolean;
    errorText?: string;
    workbookId?: string | null;
    includeClickableType?: EntryTypeNode;
};

export const EntrySelector: React.FC<EntrySelectorProps> = (props: EntrySelectorProps) => {
    const {label, errorText, entryId, handleEntryChange, scope, workbookId, isInvalid} = props;

    return (
        <FormRow label={label}>
            <FieldWrapper error={errorText}>
                <NavigationInput
                    entryId={entryId}
                    onChange={handleEntryChange}
                    workbookId={workbookId}
                    scope={scope}
                    linkMixin={b('link')}
                    navigationMixin={b('navigation')}
                    isInvalid={isInvalid}
                />
            </FieldWrapper>
        </FormRow>
    );
};
