import React from 'react';

import type {ConnectableElement} from 'react-dnd';
import {connect} from 'react-redux';
import type {Dispatch} from 'redux';
import {bindActionCreators} from 'redux';

import type {
    Field,
    Placeholder,
    Shared,
    VisualizationLayerShared,
    VisualizationWithLayersShared,
} from '../../../../../../../shared';
import {
    PlaceholderId,
    WizardVisualizationId,
    isYAGRVisualization,
} from '../../../../../../../shared';
import type {DataLensApiError, DatalensGlobalState} from '../../../../../../index';
import {sdk} from '../../../../../../index';
import {getChartType} from '../../../../../ql/store/reducers/ql';
import {removeQuickFormula} from '../../../../actions';
import {selectDatasetError, selectDatasets} from '../../../../selectors/dataset';
import {
    selectAvailable,
    selectDashboardParameters,
    selectFilters,
} from '../../../../selectors/visualization';
import type {AddableField} from '../AddField/AddField';
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
    addFieldItems?: Field[];
};

class PlaceholdersContainer extends React.PureComponent<Props> {
    render() {
        const {
            qlMode,
            qlChartType,
            visualization,
            datasetError,
            globalVisualization,
            onUpdate,
            datasets,
        } = this.props;
        const currentVisualization = getVisualizationById(
            visualization.id as WizardVisualizationId,
            qlMode,
        );

        const isYagrVisualization =
            qlMode &&
            qlChartType &&
            currentVisualization &&
            isYAGRVisualization(qlChartType, currentVisualization.id);
        const allowShapes = currentVisualization?.allowShapes && !isYagrVisualization;
        const allowSegments = currentVisualization?.allowSegments;
        const allowLabels = visualization.allowLabels && !isYagrVisualization;
        const placeholders = visualization.placeholders;

        return (
            <>
                {visualization.allowAvailable && (
                    <AvailablePlaceholder
                        wrapTo={this.renderDatasetItem}
                        datasetError={datasetError}
                        visualization={visualization}
                        globalVisualization={globalVisualization}
                        onUpdate={onUpdate}
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
                            addFieldItems={this.addFieldItems}
                        />
                    );

                    if (
                        placeholder.id === PlaceholderId.X &&
                        globalVisualization.id === WizardVisualizationId.CombinedChart
                    ) {
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
                        addFieldItems={this.addFieldItems}
                    />
                )}
                {allowShapes && (
                    <ShapesPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        addFieldItems={this.addFieldItems}
                    />
                )}
                {visualization.allowSort && (
                    <SortPlaceholder
                        multipleDatasets={datasets.length > 1}
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                    />
                )}
                {allowLabels && (
                    <LabelsPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        addFieldItems={this.addFieldItems}
                        qlMode={qlMode}
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
                        addFieldItems={this.addFieldItems}
                    />
                )}
                {allowSegments && globalVisualization?.id !== 'combined-chart' && (
                    <SegmentsPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        addFieldItems={this.addFieldItems}
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
                        />
                    )}
                {this.props.dashboardParameters.length > 0 && (
                    <DashboardParametersPlaceholder
                        wrapTo={this.renderDatasetItem}
                        onBeforeRemoveItem={this.removeItemQuickFormula}
                        datasetError={datasetError}
                        visualization={visualization}
                        onUpdate={onUpdate}
                        addFieldItems={this.addFieldItems}
                    />
                )}
            </>
        );
    }

    get filtersFromDashboard() {
        return this.props.filters.filter((filter) => filter.unsaved);
    }

    get addFieldItems() {
        const {qlMode} = this.props;

        if (qlMode) {
            return this.props.availableItems;
        } else {
            return undefined;
        }
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
        qlChartType: getChartType(state),
        availableItems: selectAvailable(state),
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(PlaceholdersContainer);
