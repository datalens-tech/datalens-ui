import React from 'react';

import {Alert, Button, Flex, Icon, Text} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {useDispatch, useSelector} from 'react-redux';
import {SignInQa} from 'shared/constants';
import {Feature} from 'shared/types';
import {DL} from 'ui/constants';
import type {CustomSigninProps} from 'ui/registry/units/auth/types/components/CustomSignin';
import {showToast} from 'ui/store/actions/toaster';
import Utils from 'ui/utils';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {selectFormData} from '../../store/selectors/signin';

import {Login} from './components/Login';
import {Password} from './components/Password';

import defaultLogoIcon from 'ui/assets/icons/logo.svg';
import rebrandingLogoIcon from 'ui/assets/icons/os-logo.svg';

import './Signin.scss';

const i18n = I18n.keyset('auth.sign-in-custom');

const b = block('dl-signin');

export const CustomSignin = ({setToken}: CustomSigninProps) => {
    const dispatch = useDispatch();

    const [errorMessage, setErrorMessage] = React.useState<null | string>(null);

    const formData = useSelector(selectFormData);

    const oidc = DL.OIDC;
    const oidc_name = DL.OIDC_NAME;
    const oidc_base_url = DL.OIDC_BASE_URL;

    const oidc_2 = DL.OIDC_2;
    const oidc_name_2 = DL.OIDC_NAME_2;
    const oidc_base_url_2 = DL.OIDC_BASE_URL_2;

    const oidc_3 = DL.OIDC_3;
    const oidc_name_3 = DL.OIDC_NAME_3;
    const oidc_base_url_3 = DL.OIDC_BASE_URL_3;

    const oidc_4 = DL.OIDC_4;
    const oidc_name_4 = DL.OIDC_NAME_4;
    const oidc_base_url_4 = DL.OIDC_BASE_URL_4;
    const releaseVersion = DL.RELEASE_VERSION;

    function onOIDCAuth() {
        window.location.href = oidc_base_url;
    }

    function onOIDC2Auth() {
        window.location.href = oidc_base_url_2;
    }

    function onOIDC3Auth() {
        window.location.href = oidc_base_url_3;
    }

    function onOIDC4Auth() {
        window.location.href = oidc_base_url_4;
    }
    const handleSubmit: React.FormEventHandler<'form'> = (event) => {
        event.preventDefault();
        if (!formData.login || !formData.password) {
            setErrorMessage(i18n('label_error-required-fields'));
            return;
        }

        Utils.getAuthToken({
            login: encodeURIComponent(formData.login),
            password: encodeURIComponent(formData.password),
        })
            .then((response) => {
                if (response.data) {
                    setToken(response.data.token);
                } else {
                    dispatch(
                        showToast({
                            title: response?.err?.message,
                            error: new Error(response?.err?.message),
                            withReport: false,
                        }),
                    );
                }
            })
            .catch((error) => {
                dispatch(
                    showToast({
                        title: i18n('error_auth_message'),
                        error: new Error(error.message),
                        withReport: false,
                    }),
                );
            });
    };

    const handleFormChange = React.useCallback(() => {
        if (errorMessage) {
            setErrorMessage(null);
        }
    }, [errorMessage]);

    const defaultLogo = isEnabledFeature(Feature.EnableDLRebranding)
        ? rebrandingLogoIcon
        : defaultLogoIcon;

    return (
        <Flex className={b()} justifyContent="center" alignItems="center">
            <Flex
                className={b('form-container')}
                direction="column"
                gap="6"
                as="form"
                qa={SignInQa.SIGN_IN_FORM}
                onChange={handleFormChange}
                onSubmit={handleSubmit}
            >
                <Flex direction="column" gap="2" alignItems="center">
                    <Icon size={32} data={defaultLogo} />
                    <Text variant="subheader-3">{i18n('title_product')}</Text>
                </Flex>
                <Flex direction="column" gap="4">
                    {errorMessage && <Alert theme="danger" message={errorMessage} />}
                    <Login qa={SignInQa.INPUT_LOGIN} />
                    <Password qa={SignInQa.INPUT_PASSWORD} />
                    <Button size="xl" view="action" type="submit">
                        {i18n('button_sign-in')}
                    </Button>
                </Flex>
                {(oidc || oidc_2 || oidc_3 || oidc_4) && (
                    <Flex gap={1}>{i18n("description")}</Flex>
                )}
                {oidc && 
                    (<Button size="xl" onClick={onOIDCAuth}>
                        {i18n('label_oidc', {oidcName: oidc_name})}
                    </Button>)}
                {oidc_2 && 
                    (<Button size="xl" onClick={onOIDC2Auth}>
                        {i18n('label_oidc', {oidcName: oidc_name_2})}
                    </Button>)}
                {oidc_3 && 
                    (<Button size="xl" onClick={onOIDC3Auth}>
                        {i18n('label_oidc', {oidcName: oidc_name_3})}
                    </Button>)}
                {oidc_4 && 
                    (<Button size="xl" onClick={onOIDC4Auth}>
                        {i18n('label_oidc', {oidcName: oidc_name_4})}
                    </Button>)}
                <div style={{
                    position: 'absolute',
                    display: 'block',
                    bottom: '10px',
                    left: '10px'
                    }}
                >
                    Версия: {releaseVersion}
                </div>
            </Flex>
        </Flex>
    );
};
