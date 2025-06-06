import React from 'react';

import block from 'bem-cn-lite';
import once from 'lodash/once';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {Redirect, Route, Switch, withRouter} from 'react-router-dom';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import type {DatalensGlobalState} from 'ui';
import {DL} from 'ui';
import Utils from 'ui/utils/utils';

import {isEmbeddedMode, isNoScrollMode} from '../../../../utils/embedded';
import IndexPage from '../IndexPage/IndexPage';
import Preview from '../Preview/Preview';

import './App.scss';
import 'ui/styles/preview.scss';

const b = block('app');
const previewBlock = block('dl-preview');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface Props extends RouteComponentProps, StateProps, DispatchProps {}

const App: React.FunctionComponent<Props> = (props) => {
    React.useEffect(() => {
        const previewClasses = previewBlock({'no-scroll': true}).split(' ');

        if (isNoScrollMode()) {
            Utils.addBodyClass(...previewClasses);
        }

        return () => {
            Utils.removeBodyClass(...previewClasses);
        };
    }, []);

    return (
        <div className={b({mobile: DL.IS_MOBILE})}>
            <Switch>
                <Route
                    path="/preview/:source/:id"
                    render={({match}) => <Redirect to={`/preview/${match.params.id}`} />}
                />
                <Route
                    path={`/preview/:id`}
                    render={(routeProps) => (
                        <Preview
                            {...routeProps}
                            isEmbedded={isEmbeddedMode()}
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
