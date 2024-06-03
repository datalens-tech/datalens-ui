import React from 'react';

import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {DatalensGlobalState, EntryDialogues} from 'ui';

import type {QLChartType} from '../../../../../shared';
import {getChartType, getConnection} from '../../store/reducers/ql';
import type {QLConnectionEntry} from '../../store/typings/ql';

import ScreenEditor from './ScreenEditor/ScreenEditor';

interface PaneMainProps {
    paneSize: number;
    chartType: QLChartType | null;
    connection: QLConnectionEntry | null;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

type PaneMainInnerProps = PaneMainProps & RouteComponentProps<{}>;

interface PaneMainState {}

class PaneMain extends React.PureComponent<PaneMainInnerProps, PaneMainState> {
    render() {
        return (
            <ScreenEditor
                paneSize={this.props.paneSize}
                entryDialoguesRef={this.props.entryDialoguesRef}
            />
        );
    }
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        chartType: getChartType(state),
        connection: getConnection(state),
    };
};

const mapDispatchToProps = {};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<PaneMainInnerProps, PaneMainProps>(withRouter)(PaneMain));
