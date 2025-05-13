import React from 'react';

import {Route, Switch} from 'react-router-dom';

import {UNIT_ROUTE} from '../constants/routes';

import {AllPage, CardPage, LandingPage} from './pages';

export function App() {
    return (
        <Switch>
            <Route exact path={UNIT_ROUTE.ROOT} render={() => <LandingPage />} />
            <Route exact path={UNIT_ROUTE.ALL} render={() => <AllPage />} />
            <Route exact path={UNIT_ROUTE.ENTRY} render={() => <CardPage />} />
        </Switch>
    );
}
