import React from 'react';

import {FormRow} from '@gravity-ui/components';
import type {PasswordInputProps} from '@gravity-ui/uikit';
import {Flex, PasswordInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectPassword, selectPasswordValidation} from '../../store/selectors/userInfoForm';

import {GeneratePasswordButton} from './GeneratePasswordButton';
import type {UserFormInputProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

const i18n = I18n.keyset('auth.form-controls');

type PasswordProps = Omit<UserFormInputProps, 'autocomplete'> &
    Pick<PasswordInputProps, 'hideCopyButton'> & {
        isCurrentPassword?: boolean;
        showGenerateButton?: boolean;
    };

export const Password = ({isCurrentPassword, showGenerateButton, ...props}: PasswordProps) => {
    const dispatch = useDispatch();

    const password = useSelector(selectPassword);
    const validation = useSelector(selectPasswordValidation);

    const handleUpdate = (value: string) => dispatch(updateFormValues({password: value}));

    return (
        <FormRow label={i18n('label_password')} className={b('row', props.rowClassName)}>
            <Flex gap={2}>
                <PasswordInput
                    autoComplete={isCurrentPassword ? 'current-password' : 'new-password'}
                    value={password}
                    onUpdate={handleUpdate}
                    validationState={validation}
                    {...props}
                />
                {showGenerateButton && <GeneratePasswordButton onGenerate={handleUpdate} />}
            </Flex>
        </FormRow>
    );
};
