import React from 'react';

import {Flex, useThemeType} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect, Route, Switch} from 'react-router-dom';
import {Feature} from 'shared';
import {DL} from 'ui/constants';
import {registry} from 'ui/registry';
import {isEnabledFeature} from 'ui/utils/isEnabledFeature';

import {AUTH_ROUTE} from '../../constants/routes';
import {resetAuthState} from '../../store/actions/common';
import {selectAuthPageInited} from '../../store/selectors/common';
import {Logout} from '../Logout/Logout';
import {Reload} from '../Reload/Reload';
import {Signup} from '../Signup/Signup';

import {useAuthPageInit} from './useAuthPageInit';

import defaultBackgroundDark from '../../../../assets/images/dl-auth-background-dark.jpg';
import defaultBackgroundLight from '../../../../assets/images/dl-auth-background-light.jpg';

import './AuthPage.scss';

const b = block('auth-page');

export type AuthPageProps = {backgroundImage?: {light: string; dark: string}};

const ContentWithBackground = ({
    children,
    backgroundImage,
}: {
    children: React.ReactNode;
    backgroundImage: string;
}) => {
    const [backgroundImageLoaded, setBackgroundImageLoaded] = React.useState(false);

    return (
        <React.Fragment>
            {isEnabledFeature(Feature.EnableDLRebranding) && (
                <img
                    className={b('background-image', {
                        loaded: backgroundImageLoaded,
                    })}
                    src={backgroundImage}
                    onLoad={() => setBackgroundImageLoaded(true)}
                    aria-hidden="true"
                />
            )}

            {children}
        </React.Fragment>
    );
};

export function AuthPage({backgroundImage}: AuthPageProps) {
    const dispatch = useDispatch();
    const authPageInited = useSelector(selectAuthPageInited);

    const theme = useThemeType();

    const {Signin} = registry.auth.components.getAll();

    useAuthPageInit();

    React.useEffect(() => {
        return () => {
            dispatch(resetAuthState());
        };
    }, [dispatch]);

    if (!authPageInited) {
        return null;
    }

    const needToSign = !DL.USER?.uid;

    const currentDefaultImage = theme === 'dark' ? defaultBackgroundDark : defaultBackgroundLight;
    const currentImage = backgroundImage?.[theme] || currentDefaultImage;

    return (
        <Flex
            direction="column"
            height="100%"
            className={b({rebranding: isEnabledFeature(Feature.EnableDLRebranding), theme})}
        >
            <Switch>
                {needToSign && (
                    <Route
                        path={AUTH_ROUTE.SIGNIN}
                        component={() => (
                            <ContentWithBackground backgroundImage={currentImage}>
                                <Signin />
                            </ContentWithBackground>
                        )}
                    />
                )}
                {needToSign && (
                    <Route
                        path={AUTH_ROUTE.SIGNUP}
                        component={() => (
                            <ContentWithBackground backgroundImage={currentImage}>
                                <Signup />
                            </ContentWithBackground>
                        )}
                    />
                )}
                <Route path={AUTH_ROUTE.RELOAD} component={Reload} />
                <Route path={AUTH_ROUTE.LOGOUT} component={Logout} />
                <Redirect to="/" />
            </Switch>
        </Flex>
    );
}
