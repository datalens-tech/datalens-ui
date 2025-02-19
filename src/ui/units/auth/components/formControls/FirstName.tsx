import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectFirstName} from '../../store/selectors/userInfoForm';

import type {UserFormInputProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

const i18n = I18n.keyset('auth.form-controls');

export const FirstName = ({autoComplete, ...props}: UserFormInputProps) => {
    const dispatch = useDispatch();

    const firstName = useSelector(selectFirstName);

    const handleUpdate = (value: string) => dispatch(updateFormValues({firstName: value}));

    return (
        <FormRow label={i18n('label_first-name')} className={b('row', props.rowClassName)}>
            <TextInput
                autoComplete={autoComplete ? 'given-name' : 'disable'}
                value={firstName}
                onUpdate={handleUpdate}
                {...props}
            />
        </FormRow>
    );
};
