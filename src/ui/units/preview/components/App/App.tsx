import React from 'react';

import once from 'lodash/once';
import {connect} from 'react-redux';
import {Route, RouteComponentProps, Switch, withRouter} from 'react-router-dom';
import {Dispatch, bindActionCreators} from 'redux';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import {DatalensGlobalState} from 'ui';
import {MobileHeader} from 'ui/components/MobileHeader/MobileHeader';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import {isEmbeddedMode, isIframe} from '../../../../utils/embedded';
import IndexPage from '../IndexPage/IndexPage';
import Preview from '../Preview/Preview';

import './App.scss';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface Props extends RouteComponentProps, StateProps, DispatchProps {}

const App: React.FunctionComponent<Props> = (props) => {
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    const embedded = isIframe() || isEmbeddedMode();

    return (
        <div className="app">
            {embedded || isAsideHeaderEnabled ? null : <MobileHeader />}
            <Switch>
                <Route
                    path={`/preview/:idOrSource+`}
                    render={(routeProps) => (
                        <Preview
                            {...routeProps}
                            isEmbedded={Boolean(embedded)}
                            asideHeaderSize={props.asideHeaderData.size}
                            setPageEntry={once(props.setCurrentPageEntry)}
                        />
                    )}
                />
                <Route path={`/preview/`} component={IndexPage} />
            </Switch>
        </div>
    );
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        asideHeaderData: state.asideHeader.asideHeaderData,
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            setCurrentPageEntry,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(App));
