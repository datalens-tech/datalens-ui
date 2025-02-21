import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectLogin, selectLoginValidation} from '../../store/selectors/userInfoForm';

import type {UserFormInputProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

const i18n = I18n.keyset('auth.form-controls');

export const Login = ({autoComplete, ...props}: UserFormInputProps) => {
    const dispatch = useDispatch();

    const login = useSelector(selectLogin);
    const validation = useSelector(selectLoginValidation);

    const handleUpdate = (value: string) => dispatch(updateFormValues({login: value}));

    return (
        <FormRow label={i18n('label_login')} className={b('row', props.rowClassName)}>
            <TextInput
                autoComplete={autoComplete ? 'nickname' : 'disable'}
                value={login}
                onUpdate={handleUpdate}
                validationState={validation}
                {...props}
            />
        </FormRow>
    );
};
