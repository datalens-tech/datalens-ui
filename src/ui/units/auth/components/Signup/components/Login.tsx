import React from 'react';

import {TextInput} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';

import {updateFormValues} from '../../../store/actions/signup';
import {selectLogin} from '../../../store/selectors/signup';

export const Login = () => {
    const dispatch = useDispatch();

    const login = useSelector(selectLogin);

    const handleUpdate = (value: string) => dispatch(updateFormValues({login: value}));

    return <TextInput value={login} onUpdate={handleUpdate} size="l" autoComplete="username" />;
};
