import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {PasswordInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {
    selectRepeatPassword,
    selectRepeatPasswordValidation,
} from '../../store/selectors/userInfoForm';

import type {UserFormInputProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

const i18n = I18n.keyset('auth.form-controls');

export const RepeatPassword = (props: Omit<UserFormInputProps, 'autocomplete'>) => {
    const dispatch = useDispatch();

    const repeatPassword = useSelector(selectRepeatPassword);
    const validation = useSelector(selectRepeatPasswordValidation);

    const handleUpdate = (value: string) => dispatch(updateFormValues({repeatPassword: value}));

    return (
        <FormRow label={i18n('label_repeat-password')} className={b('row', props.rowClassName)}>
            <PasswordInput
                autoComplete="disable"
                value={repeatPassword}
                onUpdate={handleUpdate}
                hideCopyButton={true}
                validationState={validation}
                {...props}
            />
        </FormRow>
    );
};
