import React from 'react';
import {Route, Switch, Redirect, useLocation} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {Feature} from 'shared';
import coreReducers from 'store/reducers';
import {getIsAsideHeaderEnabled} from 'components/AsideHeaderAdapter';
import LocationChange from '../components/LocationChange/LocationChange';
import {selectIsLanding} from 'store/selectors/landing';
import FallbackPage from './pages/FallbackPage/FallbackPage';
import DashAndWizardQLPages, {
    dashAndWizardQLRoutes,
} from './pages/DashAndWizardQLPages/DashAndWizardQLPages';
import {locationChangeHandler} from './helpers';
import {isEmbeddedMode, isTvMode} from '../utils/embedded';
import Utils from '../utils';
import {reducerRegistry} from '../store';
import {AsideHeaderAdapter} from 'ui/components/AsideHeaderAdapter/AsideHeaderAdapter';

import AuthPage from './pages/AuthPage/AuthPage';

reducerRegistry.register(coreReducers);

const DatasetPage = React.lazy(() => import('./pages/DatasetPage/DatasetPage'));
const EditorPage = React.lazy(() => import('./pages/EditorPage/EditorPage'));
const PreviewPage = React.lazy(() => import('./pages/PreviewPage/PreviewPage'));
const ConnectionsPage = React.lazy(
    () =>
        import(
            /* webpackChunkName: "connections-page" */ './pages/ConnectionsPage/ConnectionsPage'
        ),
);
// comment till we have main page
// const MainPage = React.lazy(() => import('./pages/MainPage/MainPage'));
const CollectionPage = React.lazy(() => import('./pages/CollectionPage/CollectionPage'));
const ServiceSettings = React.lazy(() => import('./pages/ServiceSettingsPage/ServiceSettingsPage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage/LandingPage'));
const WorkbookPage = React.lazy(() => import('./pages/WorkbookPage/WorkbookPage'));

const AuthContext = React.createContext("");

const DatalensPageView = (props: any) => {
    var token = props.token;
    var setToken = props.setToken;

    const isLanding = useSelector(selectIsLanding);
    const location = useLocation()

    if (isLanding) {
        return (
            <React.Suspense fallback={<FallbackPage />}>
                <LandingPage />
            </React.Suspense>
        );
    }
    return (
        <AuthContext.Provider value={token}>
            <React.Suspense fallback={<FallbackPage />}>
                <Switch>
                    {!token && location?.pathname !== "/auth" && <Redirect from="*" to="/auth"/>}
                    {token && <Redirect from="/auth" to="/"/>}
                    <Route
                        path={'/auth'}
                        component={()=><AuthPage setToken={setToken}/>}
                    />
                    <Route
                        path={['/workbooks/:workbookId/datasets/new', '/datasets/:id']}
                        component={DatasetPage}
                    />
                    {Utils.isEnabledFeature(Feature.EnableChartEditor) && (
                        <Route
                            path={['/editor', '/workbooks/:workbookId/editor']}
                            component={EditorPage}
                        />
                    )}
                    <Route path="/preview" component={PreviewPage} />
                    <Route
                        path={[
                            '/connections/:id',
                            '/workbooks/:workbookId/connections/new/:type',
                            '/workbooks/:workbookId/connections/new',
                        ]}
                        component={ConnectionsPage}
                    />

                    <Route
                        path={['/collections/:collectionId', '/collections']}
                        component={CollectionPage}
                    />

                    <Route exact path="/workbooks/:workbookId" component={WorkbookPage} />

                    <Route path="/settings" component={ServiceSettings} />

                    <Route exact path={dashAndWizardQLRoutes} component={DashAndWizardQLPages} />
                    <Route path="/">
                        <Redirect to={`/collections${location.search}`} />
                    </Route>

                    {/* comment till we have main page */}
                    {/*<Route path="/" component={MainPage} />*/}
                </Switch>
                <LocationChange onLocationChanged={locationChangeHandler} />
            </React.Suspense>
        </AuthContext.Provider>
    );
};

const DatalensPage: React.FC = () => {
    const showAsideHeaderAdapter = getIsAsideHeaderEnabled() && !isEmbeddedMode() && !isTvMode();
    const [token, setToken] = React.useState("");
    
    if (token && showAsideHeaderAdapter) {
        return <AsideHeaderAdapter renderContent={() => <DatalensPageView token={token} setToken={setToken} />} />;
    }

    return <DatalensPageView token={token} setToken={setToken} />;
};

export default DatalensPage;
