import React, {Component} from 'react';

import {connect} from 'react-redux';
import type {RouteComponentProps} from 'react-router-dom';
import {withRouter} from 'react-router-dom';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';
import type {Placeholder, Shared, VisualizationWithLayersShared} from 'shared';
import {isVisualizationWithLayers} from 'shared';
import type {DatalensGlobalState} from 'ui';
import {selectDatasetError} from 'units/wizard/selectors/dataset';
import {selectSubVisualization, selectVisualization} from 'units/wizard/selectors/visualization';

import {setSelectedLayerId} from '../../../actions';

import PlaceholdersContainer from './PlaceholdersContainer/PlaceholdersContainer';
import VisualizationLayersControl from './VisualizationLayersControl/VisualizationLayersControl';
import type {VisualizationSelectorOwnProps} from './VisualizationSelector/VisualizationSelector';
import VisualizationSelector from './VisualizationSelector/VisualizationSelector';

import './SectionVisualization.scss';

type StateProps = ReturnType<typeof mapStateToProps>;
type DispatchProps = ReturnType<typeof mapDispatchToProps>;

type Props = StateProps &
    DispatchProps &
    RouteComponentProps & {
        availableVisualizations: any[];
        onUpdate?: () => void;
        qlMode?: boolean;
    };

interface State {
    dialogPlaceholderVisible: boolean;
    dialogPointSizeVisible: boolean;
    dialogPlaceholderItem?: Placeholder;
}

class SectionVisualization extends Component<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            dialogPlaceholderVisible: false,
            dialogPointSizeVisible: false,
        };
    }

    componentDidUpdate() {
        const {visualization} = this.props;
        // When switching from any visualization to geo layers, we set the selected layer
        if (isVisualizationWithLayers(visualization) && !visualization.selectedLayerId) {
            const layerId = this.getGeolayers()[0].id;

            if (layerId) {
                this.props.setSelectedLayerId({layerId});
            }
        }
    }

    render() {
        const {subVisualization, visualization} = this.props;

        if (!subVisualization) {
            return null;
        }

        let extraClass = '';

        if (this.props.datasetError) {
            extraClass = ' disabled';
        }

        return (
            <div className="visualization-container">
                {this.renderVisualizationSelectorContainer()}
                <div className="placeholders-wrapper">
                    <div className={`placeholders${extraClass}`}>
                        {isVisualizationWithLayers(visualization) && this.renderMapLayersControls()}
                        <PlaceholdersContainer
                            visualization={subVisualization}
                            globalVisualization={visualization}
                            onUpdate={this.props.onUpdate}
                            qlMode={this.props.qlMode}
                        />
                    </div>
                </div>
            </div>
        );
    }

    getGeolayers() {
        const {visualization} = this.props;

        if (!visualization) {
            return [];
        }

        if (!isVisualizationWithLayers(visualization)) {
            return [];
        }

        return visualization.layers.map(({layerSettings}) => layerSettings);
    }

    renderMapLayersControls = () => {
        if (this.props.visualization.id === 'combined-chart') {
            return null;
        }

        return <VisualizationLayersControl />;
    };

    renderVisualizationSelectorContainer() {
        const {visualization, availableVisualizations, onUpdate} = this.props;

        if (!visualization) {
            return null;
        }

        const visibleVisualizations = (availableVisualizations || []).filter(
            (vis: VisualizationWithLayersShared['visualization'] | Shared['visualization']) => {
                if ('hidden' in vis) {
                    return !vis.hidden;
                }

                return true;
            },
        );

        const visualizationSelectorProps: VisualizationSelectorOwnProps = {
            visualization,
            onUpdate,
            visibleVisualizations,
        };

        if (this.props.qlMode) {
            visualizationSelectorProps.qlMode = this.props.qlMode;
        }

        return <VisualizationSelector {...visualizationSelectorProps} />;
    }
}

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        subVisualization: selectSubVisualization(state),
        visualization: selectVisualization(state),
        datasetError: selectDatasetError(state),
    };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators(
        {
            setSelectedLayerId,
        },
        dispatch,
    );
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(SectionVisualization));
