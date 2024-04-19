import React from 'react';
import {Route, Switch, Redirect} from 'react-router-dom';
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
import {MobileHeaderComponent} from 'ui/components/MobileHeader/MobileHeaderComponent/MobileHeaderComponent';
import {DL} from 'ui/constants';

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
const CollectionsNavigtaionPage = React.lazy(
    () => import('./pages/CollectionsNavigationPage/CollectionsNavigationPage'),
);
const ServiceSettings = React.lazy(() => import('./pages/ServiceSettingsPage/ServiceSettingsPage'));
const LandingPage = React.lazy(() => import('./pages/LandingPage/LandingPage'));

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

                <Route path="/settings" component={ServiceSettings} />

                <Route path={['/collections']} component={CollectionsNavigtaionPage} />

                <Route exact path={dashAndWizardQLRoutes} component={DashAndWizardQLPages} />

                <Route
                    path={['/collections/:collectionId', '/workbooks/:workbookId']}
                    component={CollectionsNavigtaionPage}
                />

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
    const showMobileHeader = !isEmbeddedMode() && DL.IS_MOBILE;

    if (showMobileHeader) {
        return <MobileHeaderComponent renderContent={() => <DatalensPageView />} />;
    }

    if (showAsideHeaderAdapter) {
        return <AsideHeaderAdapter renderContent={() => <DatalensPageView />} />;
    }

    return <DatalensPageView />;
};

export default DatalensPage;
