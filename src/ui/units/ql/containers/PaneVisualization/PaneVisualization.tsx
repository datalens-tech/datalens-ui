import React from 'react';

import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {compose} from 'recompose';
import {drawPreview} from 'units/ql/store/actions/ql';
import SectionVisualization from 'units/wizard/containers/Wizard/SectionVisualization/SectionVisualization';

import {getAvailableQlVisualizations} from '../../utils/visualization';

import './PaneVisualization.scss';

type PaneVisualizationDispatchProps = typeof mapDispatchToProps;

interface PaneVisualizationProps {
    paneSize: number;
}

type PaneVisualizationInnerProps = PaneVisualizationDispatchProps & PaneVisualizationProps & {};

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
                    this.props.drawPreview({
                        withoutTable: true,
                    });
                }}
                qlMode={true}
            />
        );
    }
}

const mapDispatchToProps = {
    drawPreview,
};

export default connect(
    null,
    mapDispatchToProps,
)(compose<PaneVisualizationInnerProps, PaneVisualizationProps>(withRouter)(PaneVisualization));
