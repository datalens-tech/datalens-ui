import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Button, Flex, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch} from 'react-redux';

import {submitSignupForm} from '../../store/actions/userInfoForm';
import {Email} from '../formControls/Email';
import {FirstName} from '../formControls/FirstName';
import {LastName} from '../formControls/LastName';
import {Login} from '../formControls/Login';
import {Password} from '../formControls/Password';
import {RepeatPassword} from '../formControls/RepeatPassword';

import {Back} from './components/Back';

import './Signup.scss';

const b = block('dl-signup');

export const Signup = () => {
    const dispatch = useDispatch();

    const handleSubmit = () => dispatch(submitSignupForm());

    return (
        <Flex className={b()} justifyContent="center" alignItems="center">
            <Flex className={b('form-container')} direction="column" gap="6" as="form">
                <Text variant="subheader-3">Sign Up</Text>
                <Flex direction="column" gap="4">
                    <Flex direction="column" gap="4">
                        <Login autoComplete={true} size="l" />
                        <Email autoComplete={true} size="l" />
                        <FirstName autoComplete={true} size="l" />
                        <LastName autoComplete={true} size="l" />
                        <Password autoComplete={true} size="l" />
                        <RepeatPassword size="l" />
                    </Flex>
                    <FormRow>
                        <Button size="l" view="action" onClick={handleSubmit}>
                            Sign up
                        </Button>
                    </FormRow>
                    <Back />
                </Flex>
            </Flex>
        </Flex>
    );
};
