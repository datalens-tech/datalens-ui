import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signin';
import {selectPassword} from '../../../store/selectors/signin';

const i18n = I18n.keyset('auth.sign-in');

export const Password = () => {
    const dispatch = useDispatch();

    const password = useSelector(selectPassword);

    const handleUpdate = (value: string) => dispatch(updateFormValues({password: value}));

    return (
        <TextInput
            type="password"
            placeholder={i18n('label_password-placeholder')}
            size="l"
            autoComplete="current-password"
            value={password}
            onUpdate={handleUpdate}
        />
    );
};
