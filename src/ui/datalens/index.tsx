import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
import {useSelector} from 'react-redux';
import {reducerRegistry} from '../store';
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
import {AsideHeaderAdapter} from 'ui/components/AsideHeaderAdapter/AsideHeaderAdapter';

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

const DatalensPageView = () => {
    const isLanding = useSelector(selectIsLanding);

    if (isLanding) {
        return (
            <React.Suspense fallback={<FallbackPage />}>
                <LandingPage />
            </React.Suspense>
        );
    }

    return (
        <React.Suspense fallback={<FallbackPage />}>
            <Switch>
                <Route
                    path={['/workbooks/:workbookId/datasets/:id', '/datasets/:id']}
                    component={DatasetPage}
                />
                <Route path="/editor" component={EditorPage} />
                <Route path="/preview" component={PreviewPage} />
                <Route
                    path={[
                        '/connections/new/:type',
                        '/connections/new',
                        '/connections/:id',
                        '/workbooks/:workbookId/connections/new/:type',
                        '/workbooks/:workbookId/connections/new',
                        '/workbooks/:workbookId/connections/:id',
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
    );
};

const DatalensPage: React.FC = () => {
    const showAsideHeaderAdapter = getIsAsideHeaderEnabled() && !isEmbeddedMode() && !isTvMode();

    if (showAsideHeaderAdapter) {
        return <AsideHeaderAdapter renderContent={DatalensPageView} />;
    }

    return <DatalensPageView />;
};

export default DatalensPage;
