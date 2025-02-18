import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectEmail} from '../../store/selectors/userInfoForm';

import type {UserFormInputProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

const i18n = I18n.keyset('auth.form-controls');

export const Email = ({autoComplete = false, ...props}: UserFormInputProps) => {
    const dispatch = useDispatch();

    const email = useSelector(selectEmail);

    const handleUpdate = (value: string) => dispatch(updateFormValues({email: value}));

    return (
        <FormRow label={i18n('label_email')} className={b('row', props.rowClassName)}>
            <TextInput
                autoComplete={autoComplete ? 'email' : 'disable'}
                value={email}
                onUpdate={handleUpdate}
                {...props}
            />
        </FormRow>
    );
};
