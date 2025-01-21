import React from 'react';

import {Button, Flex, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';
import {Link} from 'react-router-dom';

import {AUTH_ROUTE} from '../../constants/routes';
import {submitSigninForm} from '../../store/actions/signin';

import {Login} from './components/Login';
import {Password} from './components/Password';

import './Signin.scss';

const b = block('dl-signin');

export const Signin = () => {
    const dispatch = useDispatch();

    const handleSubmit = () => dispatch(submitSigninForm());

    return (
        <Flex className={b()} justifyContent="center" alignItems="center">
            <Flex className={b('form-container')} direction="column" gap="6" as="form">
                <Flex direction="column" gap="2" alignItems="center">
                    <div className={b('logo')} />
                    <Text variant="subheader-3">DataLens</Text>
                </Flex>
                <Flex direction="column" gap="4">
                    <Login />
                    <Password />
                    <Button size="l" view="action" onClick={handleSubmit}>
                        Sign in
                    </Button>
                    <Flex>
                        Don&#39;t have an account?&nbsp;
                        <Link to={AUTH_ROUTE.SIGNUP}>Sign Up</Link>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};
