import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectLogin} from '../../store/selectors/userInfoForm';

import type {UserFormInputProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

// TODO: add title to translations
// const i18n = I18n.keyset('auth.user-form-controls.view');
const i18n = (key: string) => {
    switch (key) {
        case 'label_login':
            return 'Login';
        default:
            return key;
    }
};

export const Login = ({autoComplete, ...props}: UserFormInputProps) => {
    const dispatch = useDispatch();

    const login = useSelector(selectLogin);

    const handleUpdate = (value: string) => dispatch(updateFormValues({login: value}));

    return (
        <FormRow label={i18n('label_login')} className={b('row', props.rowClassName)}>
            <TextInput
                autoComplete={autoComplete ? 'nickname' : 'disable'}
                value={login}
                onUpdate={handleUpdate}
                {...props}
            />
        </FormRow>
    );
};
