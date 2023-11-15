import React from 'react';

import block from 'bem-cn-lite';
import once from 'lodash/once';
import {connect} from 'react-redux';
import {Route, RouteComponentProps, Switch, withRouter} from 'react-router-dom';
import {Dispatch, bindActionCreators} from 'redux';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import {DatalensGlobalState} from 'ui';
import {MobileHeader} from 'ui/components/MobileHeader/MobileHeader';
import Utils from 'ui/utils/utils';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import {isEmbeddedMode, isNoScrollMode} from '../../../../utils/embedded';
import IndexPage from '../IndexPage/IndexPage';
import Preview from '../Preview/Preview';

import './App.scss';
import 'ui/styles/preview.scss';

const b = block('app');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

interface Props extends RouteComponentProps, StateProps, DispatchProps {}

const App: React.FunctionComponent<Props> = (props) => {
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    React.useEffect(() => {
        if (isNoScrollMode()) {
            Utils.addBodyClass('dl-preview', 'dl-preview_no-scroll');
        }

        return () => {
            Utils.removeBodyClass('dl-preview', 'dl-preview_no-scroll');
        };
    }, []);

    return (
        <div className={b()}>
            {isEmbeddedMode() || isAsideHeaderEnabled ? null : <MobileHeader />}
            <Switch>
                <Route
                    path={`/preview/:idOrSource+`}
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
