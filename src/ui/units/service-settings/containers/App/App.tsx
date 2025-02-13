import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {Redirect, Route, Switch} from 'react-router-dom';
import {DL} from 'ui/constants';

import './App.scss';

const b = block('service-settings-container');

const MainPage = React.lazy(() => import('../MainPage/MainPage'));
const UserProfilePage = React.lazy(() => import('../UserProfilePage/UserProfilePage'));
const CreateProfilePage = React.lazy(() => import('../CreateProfilePage/CreateProfilePage'));

export const App = () => (
    <React.Suspense fallback={<Loader size="m" className={b('loader')} />}>
        <Switch>
            {DL.AUTH_ENABLED && (
                <Route exact path={'/:root/users/new'} component={CreateProfilePage} />
            )}
            {DL.AUTH_ENABLED && <Route path={'/:root/users/:id'} component={UserProfilePage} />}
            <Route path={'/:root/:tab?'} component={MainPage} />
            <Redirect to="/:root" />
        </Switch>
    </React.Suspense>
);
