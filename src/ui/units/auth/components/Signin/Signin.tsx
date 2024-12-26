import React from 'react';

import {Button, Flex, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Link} from 'react-router-dom';

import {Login} from './components/Login';
import {Password} from './components/Password';

import './Signin.scss';

const b = block('dl-signin');

export const Signin = () => {
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
                    <Button size="l" view="action">
                        Sign in
                    </Button>
                    <Flex>
                        Don&#39;t have an account?&nbsp;
                        <Link to="/auth/signup">Sign Up</Link>
                    </Flex>
                </Flex>
            </Flex>
        </Flex>
    );
};
