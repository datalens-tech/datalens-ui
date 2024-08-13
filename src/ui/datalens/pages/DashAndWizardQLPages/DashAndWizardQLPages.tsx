import React, {lazy} from 'react';
import type {RouteComponentProps, match} from 'react-router-dom';
import {Route, Switch} from 'react-router-dom';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';

import {deleteLock} from '../../../units/dash/store/actions/dashTyped';

type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Paths = {
    wizard?: string[];
    ql?: string[];
    dash?: string[];
};

interface DashAndWizardQLAppPageProps extends RouteComponentProps, DispatchProps {
    match: match<{parentDashboardId: string}>;
    overrideDefaultPaths?: Paths;
}

export const dashAndWizardQLRoutes = [
    '/workbooks/:workbookId/wizard',
    '/wizard/:widgetId',
    '/wizard',
    '/workbooks/:workbookId/ql',
    '/ql/:qlEntryId',
    '/ql',
    '/ql/new',
    '/ql/new/monitoringql',
    '/ql/new/promql',
    '/ql/new/sql',
    '/:parentDashboardId',
    '/dashboards/new',
    '/workbooks/:workbookId/dashboards',
];

const WizardPage = lazy(() => import('../WizardPage/WizardPage'));
const QLPage = lazy(() => import('../QLPage/QLPage'));
const DashPage = lazy(() => import('../DashPage/DashPage'));

const DEFAULT_WIZARD_PATHS = ['/workbooks/:workbookId/wizard', '/wizard/:widgetId', '/wizard'];
const DEFAULT_QL_PATHS = ['/workbooks/:workbookId/ql', '/ql/:qlEntryId', '/ql'];
const DEFAULT_DASH_PATHS = [
    '/:parentDashboardId',
    '/dashboards/new',
    '/workbooks/:workbookId/dashboards',
];

class DashAndWizardQLAppPage extends React.PureComponent<DashAndWizardQLAppPageProps> {
    componentDidUpdate(prevProps: DashAndWizardQLAppPageProps) {
        const prevDashboardId = prevProps.match.params?.parentDashboardId
            ? prevProps.match.params?.parentDashboardId.split('-')[0]
            : null;

        const currentDashboardId = this.props.match.params?.parentDashboardId
            ? this.props.match.params?.parentDashboardId.split('-')[0]
            : null;

        if (prevDashboardId && prevDashboardId !== currentDashboardId) {
            this.props.deleteLock();
        }
    }

    componentWillUnmount() {
        this.props.deleteLock();
    }

    render() {
        const {overrideDefaultPaths} = this.props;

        const wizardPaths = overrideDefaultPaths?.wizard || DEFAULT_WIZARD_PATHS;
        const qlPaths = overrideDefaultPaths?.ql || DEFAULT_QL_PATHS;
        const dashPaths = overrideDefaultPaths?.dash || DEFAULT_DASH_PATHS;

        return (
            <Switch>
                <Route path={wizardPaths} component={WizardPage} />
                <Route path={qlPaths} component={QLPage} />
                <Route exact path={dashPaths} component={DashPage} />
            </Switch>
        );
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            deleteLock,
        },
        dispatch,
    );
};

export default connect(null, mapDispatchToProps)(DashAndWizardQLAppPage);
