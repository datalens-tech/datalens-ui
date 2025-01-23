import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {Route, Switch} from 'react-router-dom';

import {AUTH_ROUTE} from '../../constants/routes';
import {resetAuthState} from '../../store/actions/common';
import {selectAuthPageInited} from '../../store/selectors/common';
import {Logout} from '../Logout/Logout';
import {Reload} from '../Reload/Reload';
import {Signin} from '../Signin/Signin';
import {Signup} from '../Signup/Signup';

import {useAuthPageInit} from './useAuthPageInit';

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

    return (
        <Flex direction="column" height="100%">
            <Switch>
                <Route path={AUTH_ROUTE.SIGNIN} component={Signin} />
                <Route path={AUTH_ROUTE.SIGNUP} component={Signup} />
                <Route path={AUTH_ROUTE.RELOAD} component={Reload} />
                <Route path={AUTH_ROUTE.LOGOUT} component={Logout} />
            </Switch>
        </Flex>
    );
}
