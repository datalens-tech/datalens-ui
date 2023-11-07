import React from 'react';
import {Switch, Route} from 'react-router-dom';

import {App as DashApp} from 'units/dash/containers/App/App';
import dash from 'units/dash/store/reducers/dash';
import wizard from 'units/wizard/reducers';
import {reducerRegistry} from '../../../store';

import 'ui/styles/dash.scss';
import 'ui/styles/dl-monaco.scss';
import Utils from 'ui/utils';
import {Feature} from 'shared';
import {experimental} from 'ui/units/dash/store/slices/experimental/experimental';

reducerRegistry.register({
    dash,
    wizard,
    experimental,
});

const routePaths = ['/:id'];

if (Utils.isEnabledFeature(Feature.SaveDashWithFakeEntry)) {
    routePaths.unshift(
        '/dashboards/new',
        '/workbooks/:workbookId/dashboards',
        '/workbooks/:workbookId/dash',
    );
}

const Dash = () => (
    <Switch>
        <Route path={routePaths} component={DashApp} />
    </Switch>
);

export default Dash;
