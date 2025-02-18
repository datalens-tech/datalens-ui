import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {PasswordInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectPassword} from '../../store/selectors/userInfoForm';

import type {UserFormInputProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

// TODO: add title to translations
// const i18n = I18n.keyset('auth.user-form-controls.view');
const i18n = (key: string) => {
    switch (key) {
        case 'label_password':
            return 'Password';
        default:
            return key;
    }
};

type PasswordProps = Omit<UserFormInputProps, 'autocomplete'> & {isCurrentPassword?: boolean};

export const Password = ({isCurrentPassword, ...props}: PasswordProps) => {
    const dispatch = useDispatch();

    const password = useSelector(selectPassword);

    const handleUpdate = (value: string) => dispatch(updateFormValues({password: value}));

    return (
        <FormRow label={i18n('label_password')} className={b('row', props.rowClassName)}>
            <PasswordInput
                autoComplete={isCurrentPassword ? 'current-password' : 'new-password'}
                value={password}
                onUpdate={handleUpdate}
                {...props}
            />
        </FormRow>
    );
};
