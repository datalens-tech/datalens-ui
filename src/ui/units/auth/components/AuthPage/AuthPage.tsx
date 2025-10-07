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

import defaultBackgroundDark from '../../../../assets/images/dl-auth-background-dark.png';
import defaultBackgroundLight from '../../../../assets/images/dl-auth-background-light.png';

import './AuthPage.scss';

const b = block('auth-page');

type BackgroundImage = {
    webp?: string;
    jpg?: string;
    png?: string;
};

export type AuthPageProps = {backgroundImage?: {light: BackgroundImage; dark: BackgroundImage}};

export function AuthPage({backgroundImage}: AuthPageProps) {
    const dispatch = useDispatch();
    const authPageInited = useSelector(selectAuthPageInited);

    const [backgroundImageLoaded, setBackgroundImageLoaded] = React.useState(false);

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
    const currentPngImage = backgroundImage?.[theme].png || currentDefaultImage;

    return (
        <Flex
            direction="column"
            height="100%"
            className={b({rebranding: isEnabledFeature(Feature.EnableDLRebranding), theme})}
        >
            {isEnabledFeature(Feature.EnableDLRebranding) && (
                <picture
                    className={b('background-image-container', {
                        loaded: backgroundImageLoaded,
                    })}
                    onLoad={() => setBackgroundImageLoaded(true)}
                    aria-hidden="true"
                >
                    {/* TODO: add webp support */}
                    {/* <source type="image/webp" className={b('background-image', {
                            loaded: backgroundImageLoaded,
                        })}  src="" /> */}
                    <img
                        className={b('background-image', {
                            loaded: backgroundImageLoaded,
                        })}
                        src={currentPngImage}
                    />
                </picture>
            )}
            <Switch>
                {needToSign && <Route path={AUTH_ROUTE.SIGNIN} component={Signin} />}
                {needToSign && <Route path={AUTH_ROUTE.SIGNUP} component={Signup} />}
                <Route path={AUTH_ROUTE.RELOAD} component={Reload} />
                <Route path={AUTH_ROUTE.LOGOUT} component={Logout} />
                <Redirect to="/" />
            </Switch>
        </Flex>
    );
}
