import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signin';
import {selectLogin} from '../../../store/selectors/signin';

export const Login = () => {
    const dispatch = useDispatch();

    const login = useSelector(selectLogin);

    const handleUpdate = (value: string) => dispatch(updateFormValues({login: value}));

    return (
        <TextInput
            value={login}
            onUpdate={handleUpdate}
            placeholder="Login"
            size="l"
            autoComplete="username"
        />
    );
};
