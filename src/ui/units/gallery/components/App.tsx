import React from 'react';

import {Route, Switch, useLocation} from 'react-router-dom';
import withErrorPage from 'ui/components/ErrorPage/withErrorPage';

import {UNIT_ROUTE} from '../constants/routes';

import {AllPage, CardPage, LandingPage} from './pages';

function AppContent() {
    const {pathname} = useLocation();

    React.useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant',
        });
    }, [pathname]);

    return (
        <Switch>
            <Route exact path={UNIT_ROUTE.ROOT} render={() => <LandingPage />} />
            <Route exact path={UNIT_ROUTE.ALL} render={() => <AllPage />} />
            <Route exact path={UNIT_ROUTE.ENTRY} render={() => <CardPage />} />
        </Switch>
    );
}

export const App = withErrorPage(AppContent, undefined, {height: '100%'});
