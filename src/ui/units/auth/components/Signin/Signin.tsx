import React from 'react';

import {Alert, Button, Flex, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import type {SdkError} from 'ui/libs/schematic-sdk';
import {showToast} from 'ui/store/actions/toaster';

import {AUTH_ROUTE} from '../../constants/routes';
import {submitSigninForm} from '../../store/actions/signin';
import {selectFormData} from '../../store/selectors/signin';

import {Login} from './components/Login';
import {Password} from './components/Password';

import './Signin.scss';

const i18n = I18n.keyset('auth.sign-in');

const b = block('dl-signin');

export const Signin = ({alternativeAuthOptions}: {alternativeAuthOptions?: React.ReactNode}) => {
    const dispatch = useDispatch();

    const [errorMessage, setErrorMessage] = React.useState<null | string>(null);

    const formData = useSelector(selectFormData);

    const handleSigninError = (error: SdkError) => {
        // TODO: use code
        if (error.status === 403) {
            setErrorMessage(i18n('label_error-incorrect-fields'));
            return;
        }

        dispatch(showToast({title: error.message, error}));
    };

    const handleSubmit = () => {
        if (!formData.login || !formData.password) {
            setErrorMessage(i18n('label_error-required-fields'));
            return;
        }

        dispatch(submitSigninForm({onError: handleSigninError}));
    };

    const handleFormChange = React.useCallback(() => {
        if (errorMessage) {
            setErrorMessage(null);
        }
    }, [errorMessage]);

    return (
        <Flex className={b()} justifyContent="center" alignItems="center">
            <Flex
                className={b('form-container')}
                direction="column"
                gap="6"
                as="form"
                onChange={handleFormChange}
            >
                <Flex direction="column" gap="2" alignItems="center">
                    <div className={b('logo')} />
                    <Text variant="subheader-3">{i18n('title_product')}</Text>
                </Flex>
                <Flex direction="column" gap="4">
                    {errorMessage && <Alert theme="danger" message={errorMessage} />}
                    <Login />
                    <Password />
                    <Button size="xl" view="action" onClick={handleSubmit}>
                        {i18n('button_sign-in')}
                    </Button>
                    <Flex gap={1}>
                        {i18n('label_sign-up-hint')}
                        <Link to={AUTH_ROUTE.SIGNUP}>{i18n('label_sing-up-link')}</Link>
                    </Flex>
                </Flex>
                {alternativeAuthOptions}
            </Flex>
        </Flex>
    );
};
