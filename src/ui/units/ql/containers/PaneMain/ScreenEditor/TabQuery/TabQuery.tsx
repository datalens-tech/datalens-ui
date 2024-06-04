import React from 'react';

import block from 'bem-cn-lite';
import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import type {DatalensGlobalState, EntryDialogues, MonacoTypes} from 'ui';

import {QLChartType, isMonitoringOrPrometheusChart} from '../../../../../../../shared';
import {getChartType} from '../../../../store/reducers/ql';

import ScreenPromQL from './ScreenPromQL/ScreenPromQL';
import ScreenSQL from './ScreenSQL/ScreenSQL';

import './TabQuery.scss';

const b = block('ql-tab-query');

interface TabQueryProps {
    paneSize: number;
    chartType: QLChartType | null;
    entryDialoguesRef: React.RefObject<EntryDialogues>;
}

type TabQueryInnerProps = TabQueryProps & RouteComponentProps<{}>;

interface TabQueryState {
    editor: MonacoTypes.editor.IStandaloneCodeEditor | null;
}

class TabQuery extends React.PureComponent<TabQueryInnerProps, TabQueryState> {
    monaco: typeof MonacoTypes | null = null;

    constructor(props: TabQueryInnerProps) {
        super(props);

        this.state = {
            editor: null,
        };
    }

    render = () => {
        const {paneSize, entryDialoguesRef} = this.props;

        return (
            <div className={b()}>
                {this.props.chartType === QLChartType.Sql && (
                    <ScreenSQL
                        paneSize={paneSize}
                        entryDialoguesRef={entryDialoguesRef}
                    ></ScreenSQL>
                )}
                {this.props.chartType && isMonitoringOrPrometheusChart(this.props.chartType) && (
                    <ScreenPromQL
                        paneSize={paneSize}
                        entryDialoguesRef={entryDialoguesRef}
                    ></ScreenPromQL>
                )}
            </div>
        );
    };
}

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        chartType: getChartType(state),
    };
};

const mapDispatchToProps = {};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<TabQueryInnerProps, TabQueryProps>(withRouter)(TabQuery));
