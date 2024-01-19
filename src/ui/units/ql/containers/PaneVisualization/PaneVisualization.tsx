import React from 'react';

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {DatalensGlobalState} from 'ui';
import {drawPreviewIfValid} from 'units/ql/store/actions/ql';
import SectionVisualization from 'units/wizard/containers/Wizard/SectionVisualization/SectionVisualization';

import {getIsQLQueryEmpty} from '../../store/reducers/ql';
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
                    this.props.drawPreviewIfValid({
                        withoutTable: true,
                    });
                }}
                qlMode={true}
            />
        );
    }
}

const mapDispatchToProps = {
    drawPreviewIfValid,
};

const makeMapStateToProps = (state: DatalensGlobalState) => {
    return {
        isQueryEmpty: getIsQLQueryEmpty(state),
    };
};

export default connect(
    makeMapStateToProps,
    mapDispatchToProps,
)(compose<PaneVisualizationInnerProps, PaneVisualizationProps>(withRouter)(PaneVisualization));
