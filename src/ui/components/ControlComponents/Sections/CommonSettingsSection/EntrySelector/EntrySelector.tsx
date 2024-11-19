import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import type {StringParams} from 'shared/types';
import NavigationInput from 'ui/units/dash/components/NavigationInput/NavigationInput';
import type {EntryTypeNode} from 'ui/units/dash/modules/constants';

import {FieldWrapper} from '../../../../FieldWrapper/FieldWrapper';

import './EntrySelector.scss';

const b = block('entry-selector');

type EntrySelectorProps = {
    label: string;
    entryId: string | undefined;
    scope?: string;
    onChange: ({
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
    getEntryLink?: (entryId: string) => string;
    navigationPath: string | null;
    changeNavigationPath: (newNavigationPath: string) => void;
};

export const EntrySelector: React.FC<EntrySelectorProps> = (props: EntrySelectorProps) => {
    const {
        label,
        errorText,
        entryId,
        onChange,
        scope,
        workbookId,
        isInvalid,
        getEntryLink,
        includeClickableType,
        navigationPath,
        changeNavigationPath,
    } = props;

    return (
        <FormRow label={label}>
            <FieldWrapper error={errorText}>
                <NavigationInput
                    entryId={entryId}
                    onChange={onChange}
                    workbookId={workbookId}
                    scope={scope}
                    linkMixin={b('link')}
                    navigationMixin={b('navigation')}
                    isInvalid={isInvalid}
                    getEntryLink={getEntryLink}
                    includeClickableType={includeClickableType}
                    navigationPath={navigationPath}
                    changeNavigationPath={changeNavigationPath}
                />
            </FieldWrapper>
        </FormRow>
    );
};
