import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {DatalensGlobalState} from 'ui';
import {MobileHeader} from 'ui/components/MobileHeader/MobileHeader';

import {getIsAsideHeaderEnabled} from '../../components/AsideHeaderAdapter';
import withInaccessibleOnMobile from '../../hoc/withInaccessibleOnMobile';
import {setCurrentPageEntry} from '../../store/actions/asideHeader';

import {Page} from './components';

const b = block('conn-app');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
interface Props extends StateProps, DispatchProps {}

const App = (props: Props) => {
    const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

    React.useEffect(() => {
        return () => {
            props.setCurrentPageEntry(null);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className={b()}>
            {!isAsideHeaderEnabled && <MobileHeader />}
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
