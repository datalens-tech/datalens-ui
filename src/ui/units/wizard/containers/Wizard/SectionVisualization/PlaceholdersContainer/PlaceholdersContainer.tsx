import React from 'react';

import {ConnectableElement} from 'react-dnd';
import {connect} from 'react-redux';
import {Dispatch, bindActionCreators} from 'redux';
import {
    Field,
    Placeholder,
    Shared,
    VisualizationLayerShared,
    VisualizationWithLayersShared,
    WizardVisualizationId,
} from 'shared';
import {DataLensApiError, DatalensGlobalState, sdk} from 'ui';
import {selectDatasetError, selectDatasets} from 'units/wizard/selectors/dataset';
import {selectDashboardParameters, selectFilters} from 'units/wizard/selectors/visualization';

import {removeQuickFormula} from '../../../../actions';
import {AddableField} from '../AddField/AddField';
import VisualizationItem from '../VisualizationItem/VisualizationItem';
import VisualizationLayersControl from '../VisualizationLayersControl/VisualizationLayersControl';

import AvailablePlaceholder from './AvailablePlaceholder/AvailablePlaceholder';
import ColorsPlaceholder from './ColorsPlaceholder/ColorsPlaceholder';
import DashboardFiltersPlaceholder from './DashboardFiltersPlaceholder/DashboardFiltersPlaceholder';
import DashboardParametersPlaceholder from './DashboardParametersPlaceholder/DashboardParametersPlaceholder';
import FiltersPlaceholder from './FiltersPlaceholder/FiltersPlaceholder';
import LabelsPlaceholder from './LabelsPlaceholder/LabelsPlaceholder';
import LayerFiltersPlaceholder from './LayerFiltersPlaceholder/LayerFiltersPlaceholder';
import SegmentsPlaceholder from './SegmentsPlaceholder/SegmentsPlaceholder';
import ShapesPlaceholder from './ShapesPlaceholder/ShapesPlaceholder';
import SortPlaceholder from './SortPlaceholder/SortPlaceholder';
import TooltipsPlaceholder from './TooltipsPlaceholder/TooltipsPlaceholder';
import VisualizationPlaceholder from './VisualizationPlaceholder/VisualizationPlaceholder';
import {getVisualizationById} from './utils';

type DispatchProps = ReturnType<typeof mapDispatchToProps>;
type StateProps = ReturnType<typeof mapStateToProps>;

type Props = DispatchProps &
    StateProps & {
        visualization: Shared['visualization'];
        globalVisualization:
            | Shared['visualization']
            | VisualizationWithLayersShared['visualization'];
        onUpdate?: () => void;
        qlMode?: boolean;
    };

export type CommonPlaceholderProps = {
    wrapTo: (props: any) => ConnectableElement;
    onBeforeRemoveItem?: (item: AddableField) => Promise<void>;
    onUpdate?: () => void;
    datasetError: DataLensApiError | undefined;
    visualization: Shared['visualization'];
    qlMode?: boolean;
};

class PlaceholdersContainer extends React.PureComponent<Props> {
    render() {
        const {qlMode, visualization, datasetError, globalVisualization, onUpdate} = this.props;
        const currentVisualization = getVisualizationById(
            visualization.id as WizardVisualizationId,
            qlMode,
        );

        const placeholders = visualization.placeholders;
        const allowShapes = currentVisualization?.allowShapes;
        const allowSegments = currentVisualization?.allowSegments;

        return (
            <>
                {visualization.allowAvailable && (
                    <AvailablePlaceholder
                        wrapTo={this.renderDatasetItem}
                        datasetError={datasetError}
                        visualization={visualization}
                        globalVisualization={globalVisualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
                {placeholders.map((placeholder: Placeholder) => {
                    const placeholderNode = (
                        <VisualizationPlaceholder
                            wrapTo={this.renderDatasetItem}
                            onBeforeRemoveItem={this.removeItemQuickFormula}
                            datasetError={datasetError}
                            visualization={visualization}
                            placeholder={placeholder}
                            key={`${placeholder.id}-placeholder-component`}
                            onUpdate={onUpdate}
                            qlMode={this.props.qlMode}
                        />
                    );

                    if (placeholder.id === 'x' && globalVisualization.id === 'combined-chart') {
                        return (
                            <React.Fragment key="section-with-layer-control">
                                {placeholderNode}
                                <VisualizationLayersControl />
                            </React.Fragment>
                        );
                    }

                    return placeholderNode;
                })}
                {visualization.allowColors && (
                    <ColorsPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        globalVisualization={globalVisualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
                {allowShapes && (
                    <ShapesPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
                {visualization.allowSort && (
                    <SortPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
                {visualization.allowLabels && (
                    <LabelsPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
                {(visualization as unknown as VisualizationLayerShared['visualization'])
                    .allowTooltips && (
                    <TooltipsPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
                {allowSegments && globalVisualization?.id !== 'combined-chart' && (
                    <SegmentsPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
                {(visualization as unknown as VisualizationLayerShared['visualization'])
                    .allowLayerFilters && (
                    <LayerFiltersPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
                {(visualization as unknown as VisualizationLayerShared['visualization'])
                    .allowFilters && (
                    <FiltersPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
                {(visualization as unknown as VisualizationLayerShared['visualization'])
                    .allowFilters &&
                    this.filtersFromDashboard.length > 0 && (
                        <DashboardFiltersPlaceholder
                            wrapTo={this.renderDatasetItem}
                            onBeforeRemoveItem={this.removeItemQuickFormula}
                            datasetError={datasetError}
                            visualization={visualization}
                            onUpdate={onUpdate}
                            qlMode={this.props.qlMode}
                        />
                    )}
                {this.props.dashboardParameters.length > 0 && (
                    <DashboardParametersPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        qlMode={this.props.qlMode}
                    />
                )}
            </>
        );
    }

    get filtersFromDashboard() {
        return this.props.filters.filter((filter) => filter.unsaved);
    }

    private renderDatasetItem = (props: any) => {
        const {visualization, onUpdate} = this.props;

        const visualizationItemProps = {
            props: props,
            sdk,
            visualization,
            onUpdate,
        };

        //div is necessary because DnDItem needs a `native element node`, not a React component
        return (
            <div>
                <VisualizationItem {...visualizationItemProps} />
            </div>
        );
    };

    private removeItemQuickFormula = async (item: Field) => {
        if (item && item.quickFormula) {
            await this.props.removeQuickFormula({
                field: item,
                needUpdate: false,
                datasets: this.props.datasets,
            });
        }
    };
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return bindActionCreators({removeQuickFormula}, dispatch);
};

const mapStateToProps = (state: DatalensGlobalState) => {
    return {
        datasetError: selectDatasetError(state),
        datasets: selectDatasets(state),
        filters: selectFilters(state),
        dashboardParameters: selectDashboardParameters(state),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaceholdersContainer);
