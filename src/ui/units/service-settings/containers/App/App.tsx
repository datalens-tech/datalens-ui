import React from 'react';

import {Loader} from '@gravity-ui/uikit';
import block from 'bem-cn-lite';
import {I18n} from 'i18n';
import {Redirect, Route, Switch} from 'react-router-dom';
import {PageTitle} from 'ui/components/PageTitle';
import {DL} from 'ui/constants';
import {reducerRegistry} from 'ui/store/reducer-registry';

import {serviceSettings} from '../../store/reducers/serviceSettings';

import './App.scss';

reducerRegistry.register({serviceSettings});

const i18n = I18n.keyset('service-settings.main.view');

const b = block('service-settings-container');

const MainPage = React.lazy(() => import('../MainPage/MainPage'));
const UserProfilePage = React.lazy(() => import('../UserProfilePage/UserProfilePage'));
const CreateProfilePage = React.lazy(() => import('../CreateProfilePage/CreateProfilePage'));

export const App = () => (
    <React.Suspense fallback={<Loader size="l" className={b('loader')} />}>
        <PageTitle entry={{key: i18n('label_header')}} />
        <Switch>
            {DL.AUTH_ENABLED && (
                <Route exact path={'/settings/users/new'} component={CreateProfilePage} />
            )}
            {DL.AUTH_ENABLED && (
                <Route path={'/settings/users/:userId'} component={UserProfilePage} />
            )}
            <Route path={'/settings/:tab?'} component={MainPage} />
            <Redirect to="/settings" />
        </Switch>
    </React.Suspense>
);
