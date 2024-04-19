import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {QLChartType} from 'shared';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import {DL, DatalensGlobalState, Utils} from 'ui';

import {getIsAsideHeaderEnabled} from '../../../../components/AsideHeaderAdapter';
import withInaccessibleOnMobile from '../../../../hoc/withInaccessibleOnMobile';
import {dispatchResize} from '../../modules/helpers';
import {getEntry} from '../../store/reducers/ql';
import QL from '../QL/QL';

import './App.scss';

const b = block('ql-app');

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type Props = StateProps &
    DispatchProps & {
        chartType?: QLChartType | null;
    };

const isAsideHeaderEnabled = getIsAsideHeaderEnabled();

class App extends React.PureComponent<Props> {
    componentDidMount() {
        Utils.addBodyClass('dl-ql');
        this.updatePageEntry();
    }

    componentDidUpdate(prevProps: Props) {
        if (
            isAsideHeaderEnabled &&
            prevProps.asideHeaderData.size !== this.props.asideHeaderData.size
        ) {
            dispatchResize();
        }

        if (prevProps.entry !== this.props.entry) {
            this.updatePageEntry();
            this.forceUpdate();
        }
    }

    componentWillUnmount() {
        Utils.removeBodyClass('dl-ql');
    }

    render() {
        const {asideHeaderData} = this.props;

        return (
            <div className={b({mobile: DL.IS_MOBILE})}>
                <div className={b('content')}>
                    <QL size={asideHeaderData.size} />
                </div>
            </div>
        );
    }

    private updatePageEntry() {
        const {entry} = this.props;

        if (isAsideHeaderEnabled) {
            this.props.setCurrentPageEntry(entry);
        }
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        entry: getEntry(state),
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

export default withInaccessibleOnMobile(connect(mapStateToProps, mapDispatchToProps)(App));
