import React from 'react';

import {Route, Switch} from 'react-router-dom';
import withErrorPage from 'ui/components/ErrorPage/withErrorPage';

import {UNIT_ROUTE} from '../constants/routes';

import {AllPage, CardPage, LandingPage} from './pages';

function AppContent({isPromo}: {isPromo?: boolean}) {
    return (
        <Switch>
            <Route exact path={UNIT_ROUTE.ROOT} render={() => <LandingPage isPromo={isPromo} />} />
            <Route exact path={UNIT_ROUTE.ALL} render={() => <AllPage isPromo={isPromo} />} />
            <Route exact path={UNIT_ROUTE.ENTRY} render={() => <CardPage isPromo={isPromo} />} />
        </Switch>
    );
}

export const App = withErrorPage(AppContent, undefined, {height: '100%'});
