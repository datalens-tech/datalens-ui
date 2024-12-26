import React from 'react';

import block from 'bem-cn-lite';
import {useDispatch, useSelector} from 'react-redux';
import {Route, Switch} from 'react-router-dom';

import {resetAuthState} from '../../store/actions';
import {selectAuthPageInited} from '../../store/selectors';
import {Reload} from '../Reload/Reload';
import {Signin} from '../Signin/Signin';
import {Signup} from '../Signup/Signup';

import {useAuthPageInit} from './useAuthPageInit';

import './AuthPage.scss';

const b = block('dl-auth-page');

export function AuthPage() {
    const dispatch = useDispatch();
    useAuthPageInit();
    const authPageInited = useSelector(selectAuthPageInited);

    React.useEffect(() => {
        return () => {
            dispatch(resetAuthState());
        };
    }, [dispatch]);

    if (!authPageInited) {
        return null;
    }

    return (
        <div className={b()}>
            <Switch>
                <Route path="/auth/reload" component={Reload} />
                <Route path="/auth/signin" component={Signin} />
                <Route path="/auth/signup" component={Signup} />
            </Switch>
        </div>
    );
}
