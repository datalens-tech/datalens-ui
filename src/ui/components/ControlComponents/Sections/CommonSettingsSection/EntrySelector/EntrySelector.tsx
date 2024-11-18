import React from 'react';

import {FormRow} from '@gravity-ui/components';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import type {StringParams} from 'shared/types';
import NavigationInput from 'ui/units/dash/components/NavigationInput/NavigationInput';
import type {EntryTypeNode} from 'ui/units/dash/modules/constants';
import {changeNavigationPath} from 'ui/units/dash/store/actions/dashTyped';
import {selectNavigationPath} from 'ui/units/dash/store/selectors/dashTypedSelectors';

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
    } = props;

    const dispatch = useDispatch();
    const navigationPath = useSelector(selectNavigationPath);

    const handleChangeNavigationPath = (newNavigationPath: string) => {
        dispatch(changeNavigationPath(newNavigationPath));
    };

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
                    changeNavigationPath={handleChangeNavigationPath}
                />
            </FieldWrapper>
        </FormRow>
    );
};
