import React from 'react';

import {FormRow} from '@gravity-ui/components';
import {Alert, Button, Flex, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch} from 'react-redux';
import {InterpolatedText} from 'ui/components/InterpolatedText/InterpolatedText';

import {
    resetUserInfoFormValidation,
    submitSignupForm,
    validateFormValues,
} from '../../store/actions/userInfoForm';
import {Email} from '../formControls/Email';
import {FirstName} from '../formControls/FirstName';
import {LastName} from '../formControls/LastName';
import {Login} from '../formControls/Login';
import {Password} from '../formControls/Password';
import {RepeatPassword} from '../formControls/RepeatPassword';

import {Back} from './components/Back';

import './Signup.scss';

const i18n = I18n.keyset('auth.sign-up');

const b = block('dl-signup');

export const Signup = () => {
    const dispatch = useDispatch();

    const [errorMessage, setErrorMessage] = React.useState<null | string>(null);

    const handleSubmit = () => {
        dispatch(
            validateFormValues({
                onSuccess: () => {
                    dispatch(submitSignupForm());
                },
                onError: setErrorMessage,
            }),
        );
    };

    const handleFormChange = () => {
        setErrorMessage(null);
        dispatch(resetUserInfoFormValidation());
    };

    return (
        <Flex className={b()} justifyContent="center" alignItems="center">
            <Flex
                className={b('form-container')}
                direction="column"
                gap="6"
                as="form"
                onChange={handleFormChange}
            >
                <Text variant="subheader-3">{i18n('title_sign-up')}</Text>
                <Flex direction="column" gap="4">
                    {errorMessage && (
                        <Alert
                            theme="danger"
                            message={<InterpolatedText text={errorMessage} br />}
                        />
                    )}
                    <Flex direction="column" gap="4">
                        <Login autoComplete={true} size="l" />
                        <Email autoComplete={true} size="l" />
                        <FirstName autoComplete={true} size="l" />
                        <LastName autoComplete={true} size="l" />
                        <Password size="l" />
                        <RepeatPassword size="l" />
                    </Flex>
                    <FormRow>
                        <Button size="xl" view="action" onClick={handleSubmit}>
                            {i18n('button_sign-up')}
                        </Button>
                    </FormRow>
                    <Back />
                </Flex>
            </Flex>
        </Flex>
    );
};
