import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {QLChartType} from 'shared';
import {setCurrentPageEntry} from 'store/actions/asideHeader';
import type {DatalensGlobalState} from 'ui';
import {DL, Utils} from 'ui';

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

        if (prevProps.entry?.entryId !== this.props.entry?.entryId) {
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
