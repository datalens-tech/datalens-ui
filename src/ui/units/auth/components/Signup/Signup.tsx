import React from 'react';

import {Button, Flex, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';

import {submitSignupForm} from '../../store/actions/signup';

import {Back} from './components/Back';
import {Email} from './components/Email';
import {FirstName} from './components/FirstName';
import {LastName} from './components/LastName';
import {Login} from './components/Login';
import {Password} from './components/Password';
import {RepeatPassword} from './components/RepeatPassword';
import {Row} from './components/Row';

import './Signup.scss';

const b = block('dl-signup');

export const Signup = () => {
    const dispatch = useDispatch();

    const handleSubmit = () => dispatch(submitSignupForm());

    return (
        <Flex className={b()} justifyContent="center" alignItems="center">
            <Flex className={b('form-container')} direction="column" gap="6" as="form">
                <Text variant="subheader-3">DataLens</Text>
                <Flex direction="column" gap="4">
                    <Row title="Login">
                        <Login />
                    </Row>
                    <Row title="Email">
                        <Email />
                    </Row>
                    <Row title="First Name">
                        <FirstName />
                    </Row>
                    <Row title="Last Name">
                        <LastName />
                    </Row>
                    <Row title="Password">
                        <Password />
                    </Row>
                    <Row title="Repeat Password">
                        <RepeatPassword />
                    </Row>
                    <Row>
                        <Button size="l" view="action" onClick={handleSubmit}>
                            Sign up
                        </Button>
                    </Row>
                    <Back />
                </Flex>
            </Flex>
        </Flex>
    );
};
