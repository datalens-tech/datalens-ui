import React from 'react';

import {Redirect, Route, Switch} from 'react-router-dom';
import type {RouteComponentProps} from 'react-router-dom';

import withInaccessibleOnMobile from '../../../../hoc/withInaccessibleOnMobile';
import {EditorUrls} from '../../constants/common';
import EditorPage from '../../containers/EditorPage/EditorPage';
import {getFullPathName} from '../../utils';

type AppRouteProps = RouteComponentProps<{workbookId?: string}>;

function App() {
    return (
        <React.Fragment>
            <Switch>
                <Route
                    path={[
                        '/editor/:path/:template?',
                        '/workbooks/:workbookId/editor/:path/:template?',
                    ]}
                    component={
                        EditorPage as unknown as React.ComponentType<RouteComponentProps<any>>
                    }
                />
                <Route
                    path={['/editor', '/workbooks/:workbookId/editor']}
                    component={(props: AppRouteProps) => {
                        const {workbookId} = props.match.params;
                        return (
                            <Redirect
                                to={getFullPathName({base: EditorUrls.NewEntry, workbookId})}
                            />
                        );
                    }}
                />
            </Switch>
        </React.Fragment>
    );
}

export default withInaccessibleOnMobile(App);
