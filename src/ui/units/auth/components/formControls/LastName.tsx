import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {TextInput} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../store/actions/userInfoForm';
import {selectLastName} from '../../store/selectors/userInfoForm';

import type {UserFormInputProps} from './types';

import './formControls.scss';

const b = block('user-info-form-controls');

const i18n = I18n.keyset('auth.form-controls');

export const LastName = ({autoComplete, ...props}: UserFormInputProps) => {
    const dispatch = useDispatch();

    const lastName = useSelector(selectLastName);

    const handleUpdate = (value: string) => dispatch(updateFormValues({lastName: value}));

    return (
        <FormRow label={i18n('label_last-name')} className={b('row', props.rowClassName)}>
            <TextInput
                autoComplete={autoComplete ? 'family-name' : 'disable'}
                value={lastName}
                onUpdate={handleUpdate}
                {...props}
            />
        </FormRow>
    );
};
