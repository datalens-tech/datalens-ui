import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {Redirect, Route, Switch} from 'react-router-dom';
import {DL} from 'ui/constants';
import {registry} from 'ui/registry';

import {AUTH_ROUTE} from '../../constants/routes';
import {resetAuthState} from '../../store/actions/common';
import {selectAuthPageInited} from '../../store/selectors/common';
import {Logout} from '../Logout/Logout';
import {Reload} from '../Reload/Reload';
import {Signup} from '../Signup/Signup';

import {useAuthPageInit} from './useAuthPageInit';

const {Signin} = registry.auth.components.getAll();

export function AuthPage() {
    const dispatch = useDispatch();
    const authPageInited = useSelector(selectAuthPageInited);

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

    return (
        <Flex direction="column" height="100%">
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
