import React from 'react';

import {Redirect, Route, Switch} from 'react-router-dom';
import type {RouteComponentProps} from 'react-router-dom';

import withInaccessibleOnMobile from '../../../../hoc/withInaccessibleOnMobile';
import {EditorUrls} from '../../constants/common';
import EditorPage from '../../containers/EditorPage/EditorPage';
import {getFullPathName} from '../../utils';

const EditorPageView = EditorPage as unknown as React.ComponentType<RouteComponentProps<any>>;

type AppRouteProps = RouteComponentProps<{workbookId?: string; path?: string; template?: string}>;

function App() {
    return (
        <React.Fragment>
            <Switch>
                <Route
                    path={['/editor/draft', '/workbooks/:workbookId/editor/draft']}
                    component={(props: AppRouteProps) => (
                        <Redirect
                            to={getFullPathName({
                                base: EditorUrls.NewEntry,
                                workbookId: props.match.params.workbookId,
                            })}
                        />
                    )}
                />
                <Route
                    path={[
                        '/editor/:path/:template?',
                        '/workbooks/:workbookId/editor/:path/:template?',
                    ]}
                    component={EditorPageView}
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
