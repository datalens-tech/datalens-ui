import React from 'react';

import {Flex} from '@gravity-ui/uikit';
import {useDispatch, useSelector} from 'react-redux';
import {Route, Switch} from 'react-router-dom';

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
                <Route path="/auth/signin" component={Signin} />
                <Route path="/auth/signup" component={Signup} />
                <Route path="/auth/reload" component={Reload} />
                <Route path="/auth/logout" component={Logout} />
            </Switch>
        </Flex>
    );
}
