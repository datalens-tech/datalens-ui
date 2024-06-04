import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {DatalensGlobalState} from 'ui';

import withInaccessibleOnMobile from '../../hoc/withInaccessibleOnMobile';
import {setCurrentPageEntry} from '../../store/actions/asideHeader';

import {Page} from './components';

const b = block('conn-app');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
interface Props extends StateProps, DispatchProps {}

const App = (props: Props) => {
    React.useEffect(() => {
        return () => {
            props.setCurrentPageEntry(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={b()}>
            <Page />
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

export default connect(mapStateToProps, mapDispatchToProps)(withInaccessibleOnMobile(App));
