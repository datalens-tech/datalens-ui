import React from 'react';

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {QLChartType} from 'shared';
import {DatalensGlobalState} from 'ui';
import {drawPreview} from 'units/ql/store/actions/ql';
import SectionVisualization from 'units/wizard/containers/Wizard/SectionVisualization/SectionVisualization';

import {getChartType, getQueries, getQueryValue} from '../../store/reducers/ql';
import {getAvailableQlVisualizations} from '../../utils/visualization';

import './PaneVisualization.scss';

type PaneVisualizationStateProps = ReturnType<typeof makeMapStateToProps>;

type PaneVisualizationDispatchProps = typeof mapDispatchToProps;

interface PaneVisualizationProps {
    paneSize: number;
}

type PaneVisualizationInnerProps = PaneVisualizationDispatchProps &
    PaneVisualizationStateProps &
    PaneVisualizationProps & {};

interface PaneVisualizationState {}

class PaneVisualization extends React.PureComponent<
    PaneVisualizationInnerProps,
    PaneVisualizationState
> {
    render() {
        return (
            <SectionVisualization
                availableVisualizations={getAvailableQlVisualizations()}
                onUpdate={() => {
                    let canRerender;
                    switch (this.props.chartType) {
                        case QLChartType.Monitoringql:
                        case QLChartType.Promql: {
                            const queriesExists = this.props.queries.length !== 0;
                            const someQueryHasValue = this.props.queries.some((q) =>
                                this.isQueryNotEmpty(q.value),
                            );
                            canRerender = queriesExists && someQueryHasValue;
                            break;
                        }

                        case QLChartType.Sql:
                        default: {
                            canRerender = this.isQueryNotEmpty(this.props.queryValue);
                        }
                    }

                    if (!canRerender) {
                        return;
                    }

                    this.props.drawPreview({
                        withoutTable: true,
                    });
                }}
                qlMode={true}
            />
        );
    }

    private isQueryNotEmpty(query: string): boolean {
        return query.trim().length > 0;
    }
}

const mapDispatchToProps = {
    drawPreview,
};

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        queryValue: getQueryValue(state),
        queries: getQueries(state),
        chartType: getChartType(state),
    };
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<PaneVisualizationInnerProps, PaneVisualizationProps>(withRouter)(PaneVisualization));
