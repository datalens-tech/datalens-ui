import React from 'react';

import {Alert, Button, Flex, Icon, Text, useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {Link} from 'react-router-dom';
import {Feature} from 'shared';
import {SignInQa} from 'shared/constants';
import {DL} from 'ui/constants';
import type {SdkError} from 'ui/libs/schematic-sdk';
import type {SigninProps} from 'ui/registry/units/auth/types/components/Signin';
import {showToast} from 'ui/store/actions/toaster';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {AUTH_ROUTE} from '../../constants/routes';
import {submitSigninForm} from '../../store/actions/signin';
import {selectFormData} from '../../store/selectors/signin';

import {Login} from './components/Login';
import {Password} from './components/Password';

import darkLogo from 'ui/assets/icons/dl-auth-logo-dark.svg';
import lightLogo from 'ui/assets/icons/dl-auth-logo-light.svg';
import defaultLogoIcon from 'ui/assets/icons/logo.svg';

import './Signin.scss';

const i18n = I18n.keyset('auth.sign-in');

const b = block('dl-signin');

export const Signin = ({alternativeAuthOptions, logoIcon}: SigninProps) => {
    const dispatch = useDispatch();

    const [errorMessage, setErrorMessage] = React.useState<null | string>(null);

    const formData = useSelector(selectFormData);

    const isEnabledRebranding = isEnabledFeature(Feature.EnableDLRebranding);

    const theme = useThemeType();
    const updatedLogo = theme === 'dark' ? darkLogo : lightLogo;
    const logo = isEnabledRebranding ? updatedLogo : defaultLogoIcon;

    const handleSigninError = (error: SdkError) => {
        // TODO: use code
        if (error.status === 403) {
            setErrorMessage(i18n('label_error-incorrect-fields'));
            return;
        }

        dispatch(showToast({title: error.message, error}));
    };

    const handleSubmit: React.FormEventHandler<'form'> = (event) => {
        event.preventDefault();
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
        <Flex
            className={b({rebranding: isEnabledRebranding})}
            justifyContent="center"
            alignItems="center"
        >
            <Flex
                className={b('form-container')}
                direction="column"
                gap="6"
                as="form"
                qa={SignInQa.SIGN_IN_FORM}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
            >
                {isEnabledRebranding ? (
                    <Icon data={logo} width="100%" />
                ) : (
                    <Flex direction="column" gap="2" alignItems="center">
                        <Icon size={32} data={logoIcon || logo} />
                        <Text variant="subheader-3">{i18n('title_product')}</Text>
                    </Flex>
                )}
                <Flex direction="column" gap={isEnabledRebranding ? 6 : 4}>
                    {errorMessage && <Alert theme="danger" message={errorMessage} />}
                    <Login qa={SignInQa.INPUT_LOGIN} />
                    <Password qa={SignInQa.INPUT_PASSWORD} />
                    <Button size="xl" view="action" type="submit">
                        {i18n('button_sign-in')}
                    </Button>
                    {!DL.AUTH_SIGNUP_DISABLED && (
                        <Flex gap={1}>
                            {i18n('label_sign-up-hint')}
                            <Link to={AUTH_ROUTE.SIGNUP} className={b('link')}>
                                {i18n('label_sing-up-link')}
                            </Link>
                        </Flex>
                    )}
                </Flex>
                {alternativeAuthOptions}
            </Flex>
        </Flex>
    );
};
