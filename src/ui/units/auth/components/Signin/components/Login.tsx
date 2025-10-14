import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signin';
import {selectLogin} from '../../../store/selectors/signin';

const i18n = I18n.keyset('auth.sign-in');

type Props = {qa?: string};

export const Login = ({qa}: Props) => {
    const dispatch = useDispatch();

    const login = useSelector(selectLogin);

    const handleUpdate = (value: string) => dispatch(updateFormValues({login: value}));

    return (
        <TextInput
            value={login}
            onUpdate={handleUpdate}
            placeholder={i18n('label_login-placeholder')}
            size="l"
            autoComplete="username"
            autoFocus
            qa={qa}
        />
    );
};
