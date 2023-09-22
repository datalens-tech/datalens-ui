import React from 'react';

import {Redirect, Route, Switch} from 'react-router-dom';

import withInaccessibleOnMobile from '../../../../hoc/withInaccessibleOnMobile';
import {EditorUrls} from '../../constants/common';
import EditorPage from '../../containers/EditorPage/EditorPage';

function App() {
    return (
        <React.Fragment>
            <Switch>
                <Route path="/editor/:path/:template?" component={EditorPage} />
                <Redirect from={EditorUrls.Base} to={EditorUrls.NewEntry} />
            </Switch>
        </React.Fragment>
    );
}

export default withInaccessibleOnMobile(App);
